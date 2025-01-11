import { ResolveBasenamesResult } from "@/lib/ai/actions/resolveBasenames";
import { ActionComponentProps } from "@/types/actions";

type ResolveBasenameProps = ActionComponentProps<ResolveBasenamesResult>

export function ResolveBasename({result, isLoading}: ResolveBasenameProps) {
    if (isLoading) {
        return <div>Resolving basename...</div>
    }

    if (!result || result.error) {
        return <div>Error resolving basename: {result?.error}</div>
    }

    return <div>
        <p>Resolved basename: {result?.data?.address}</p>
    </div>
}