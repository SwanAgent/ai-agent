import { WalrusClient } from "../walrus/client";
import { NewBlob } from "../walrus/interface";
import { ExistingBlob } from "../walrus/interface";

export const DEFAULT_KNOWLEDGE_BASE_BLOB_ID = "9HPpLL7BSA7kTTPpYs3k6HKkzyUzlmmfhini_77IGXg"
export const walrusProvider = new WalrusClient();

export const getKnowledgeBase = async (id: string = DEFAULT_KNOWLEDGE_BASE_BLOB_ID) => {
    try {
        const result: Blob = await walrusProvider.retrieve(id)
        const blob = await result.text()
        return blob
    } catch (error) {
        console.error("Walrus retrieve error: ", error)
        return ""
    }
}

function getBlobId(result: NewBlob | ExistingBlob): string {
    if ('newlyCreated' in result) {
        return result.newlyCreated.blobObject.blobId;
    } else if ('alreadyCertified' in result) {
        return result.alreadyCertified.blobId;
    }
    throw new Error('Invalid blob result type');
}

export const updateKnowledgeBase = async (knowledge: string) => {
    try {
        const result: NewBlob | ExistingBlob = await walrusProvider.store(knowledge);
        const blobId = getBlobId(result);
        return blobId
    } catch (error) {
        console.error("Walrus update error: ", error)
        return ""
    }
}