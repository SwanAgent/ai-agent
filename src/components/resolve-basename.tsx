import { ResolveBasenamesResult } from "@/lib/ai/actions/resolveBasenames";


export default function ResolveBasename({data, isLoading}: {data: ResolveBasenamesResult, isLoading?: boolean}) {
    if (isLoading) {
        return <div>Resolving basename...</div>
    }

    if (data.error) {
        return <div>Error resolving basename: {data.error}</div>
    }

    return <div>
        <p>Resolved basename: {data.data?.address}</p>
    </div>
}