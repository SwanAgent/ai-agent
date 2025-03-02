"use client";

import React, { useEffect, useState } from 'react';
import { IntegrationsGrid } from '../home/components/integrations-grid';
import { getKnowledgeBase, updateKnowledgeBase } from '../../../lib/services/walrus-provider';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Pencil, Save, X } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { toast } from 'sonner';
import { updateUserBlobId } from '@/server/actions/user';

export default function AgentsPage() {
    const [knowledge, setKnowledge] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const { user, isLoading: userLoading } = useUser()
    const blobId = ((user?.metadata ?? {}) as { blobId?: string })['blobId']
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (userLoading) return
        const fetchKnowledge = async () => {
            try {
                const knowledge = await getKnowledgeBase(blobId)
                setKnowledge(knowledge)
            } finally {
                setIsLoading(false)
            }
        }
        fetchKnowledge()
    }, [blobId, userLoading])

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            const blobId = await updateKnowledgeBase(knowledge);
            if (!blobId) {
                throw new Error("Failed to update knowledge base");
            }

            const result = await updateUserBlobId({ blobId });
            if (!result?.data && result?.data?.error) {
                throw new Error("Failed to update user blob ID");
            }

            toast.success("Knowledge base updated successfully");
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating knowledge base:", error);
            toast.error("Failed to update knowledge base");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <AgentsPageSkeleton />
        );
    }

    return (
        <div className="container mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Agents</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your agents
                </p>
            </div>

            <div className="mb-8">
                <div className="relative">
                    <div className="text-md mb-4 text-muted-foreground">Foam Long Term Memory ( Powered By <a href="https://www.walrus.xyz/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Walrus</a> )</div>
                    {isEditing ? (
                        <>
                            <textarea
                                value={knowledge}
                                onChange={(e) => setKnowledge(e.target.value)}
                                className="w-full min-h-[400px] p-4 border rounded-lg mb-4"
                                placeholder="Enter agent knowledge here..."
                            />
                            <div className="flex justify-end gap-2">
                                {!isSaving && <Button
                                    variant="outline"
                                    onClick={() => setIsEditing(false)}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>}
                                <Button
                                    onClick={handleUpdate}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="animate-spin mr-2">⏳</span>
                                            Saving
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="prose prose-stone dark:prose-invert max-w-none p-4 border rounded-lg mb-4 h-[400px] overflow-y-auto">
                                <ReactMarkdown>{knowledge}</ReactMarkdown>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="text-2xl mb-4 mt-3">Supported Agents</div>
            <IntegrationsGrid />
        </div>
    );
}

function AgentsPageSkeleton() {
    return (
        <div className="container mx-auto p-8">
            <div className="mb-8">
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2" />
            </div>

            <div className="mb-8">
                <div className="w-full h-[400px] bg-gray-200 rounded-lg animate-pulse mb-4" />
                <div className="flex justify-end">
                    <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse" />
                </div>
            </div>

            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
                ))}
            </div>
        </div>
    )
}