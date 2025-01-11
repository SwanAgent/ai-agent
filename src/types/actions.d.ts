export type ActionResponse<T> = {
    success: boolean;
    error?: string;
    data?: T;
    signTransaction?: boolean;
    suppressFollowUp?: boolean;
}

export type ActionComponentProps<T> = {
    result?: T;
    isLoading?: boolean;
    className?: string;
}