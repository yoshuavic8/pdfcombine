use lopdf::{Bookmark, Document, Object, ObjectId};
use std::collections::BTreeMap;
use std::path::Path;

pub struct PdfInfo {
    pub path: String,
    pub filename: String,
    pub page_count: u32,
}

pub fn get_info(path: &str) -> Result<PdfInfo, String> {
    let p = Path::new(path);
    let filename = p
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| path.to_string());

    let doc = Document::load(path).map_err(|e| format!("Failed to read '{}': {}", filename, e))?;
    let page_count = doc.get_pages().len() as u32;

    if page_count == 0 {
        return Err(format!("'{}' has no pages", filename));
    }

    Ok(PdfInfo {
        path: path.to_string(),
        filename,
        page_count,
    })
}

pub fn merge(paths: &[String]) -> Result<Vec<u8>, String> {
    if paths.len() < 2 {
        return Err("Need at least 2 PDFs to merge".into());
    }

    let documents: Vec<Document> = paths
        .iter()
        .map(|p| Document::load(p).map_err(|e| format!("Failed to load '{}': {}", p, e)))
        .collect::<Result<Vec<_>, _>>()?;

    let mut merged_doc = merge_documents(documents)?;

    let mut buffer = Vec::new();
    merged_doc
        .save_to(&mut buffer)
        .map_err(|e| format!("Failed to serialize merged PDF: {}", e))?;

    Ok(buffer)
}

fn merge_documents(documents: Vec<Document>) -> Result<Document, String> {
    let mut max_id = 1u32;
    let mut documents_pages: BTreeMap<ObjectId, Object> = BTreeMap::new();
    let mut documents_objects: BTreeMap<ObjectId, Object> = BTreeMap::new();
    let mut document = Document::with_version("1.5");

    let mut pagenum = 1u32;

    for mut doc in documents {
        doc.renumber_objects_with(max_id);
        max_id = doc.max_id + 1;

        let mut first_object: Option<ObjectId> = None;

        let pages = doc.get_pages();
        for (_page_num, object_id) in &pages {
            if first_object.is_none() {
                first_object = Some(*object_id);
            }
            if let Ok(obj) = doc.get_object(*object_id) {
                documents_pages.insert(*object_id, obj.clone());
            }
        }

        documents_objects.extend(doc.objects);

        if let Some(obj) = first_object {
            let display = format!("Page {}", pagenum);
            document.add_bookmark(
                Bookmark::new(display, [0.0, 0.0, 0.0], 0, obj),
                None,
            );
        }
        pagenum += 1;
    }

    let mut catalog_object: Option<(ObjectId, Object)> = None;
    let mut pages_object: Option<(ObjectId, Object)> = None;

    for (object_id, object) in documents_objects.into_iter() {
        match object.type_name().unwrap_or(b"") {
            b"Catalog" => {
                catalog_object = Some((
                    catalog_object.map_or(object_id, |(id, _)| id),
                    object,
                ));
            }
            b"Pages" => {
                if let Ok(dictionary) = object.as_dict() {
                    let mut dictionary = dictionary.clone();
                    if let Some((_, ref existing)) = pages_object {
                        if let Ok(old_dict) = existing.as_dict() {
                            dictionary.extend(old_dict);
                        }
                    }
                    pages_object = Some((
                        pages_object.map_or(object_id, |(id, _)| id),
                        Object::Dictionary(dictionary),
                    ));
                }
            }
            b"Page" | b"Outlines" | b"Outline" => {}
            _ => {
                document.objects.insert(object_id, object);
            }
        }
    }

    let pages_object = pages_object.ok_or("No Pages root found in input PDFs")?;
    let catalog_object = catalog_object.ok_or("No Catalog found in input PDFs")?;

    let (catalog_id, catalog_obj) = catalog_object;
    let (page_id, page_obj) = pages_object;

    for (object_id, object) in documents_pages.iter() {
        if let Ok(dictionary) = object.as_dict() {
            let mut dictionary = dictionary.clone();
            dictionary.set("Parent", page_id);
            document
                .objects
                .insert(*object_id, Object::Dictionary(dictionary));
        }
    }

    if let Ok(dictionary) = page_obj.as_dict() {
        let mut dictionary = dictionary.clone();
        dictionary.set("Count", documents_pages.len() as u32);
        dictionary.set(
            "Kids",
            documents_pages
                .keys()
                .map(|id| Object::Reference(*id))
                .collect::<Vec<_>>(),
        );
        document
            .objects
            .insert(page_id, Object::Dictionary(dictionary));
    }

    if let Ok(dictionary) = catalog_obj.as_dict() {
        let mut dictionary = dictionary.clone();
        dictionary.set("Pages", page_id);
        dictionary.remove(b"Outlines");
        document
            .objects
            .insert(catalog_id, Object::Dictionary(dictionary));
    }

    document.trailer.set("Root", catalog_id);
    document.max_id = document.objects.len() as u32;
    document.renumber_objects();
    document.adjust_zero_pages();

    if let Some(outline_id) = document.build_outline() {
        if let Ok(Object::Dictionary(dict)) = document.get_object_mut(catalog_id) {
            dict.set("Outlines", Object::Reference(outline_id));
        }
    }

    Ok(document)
}
