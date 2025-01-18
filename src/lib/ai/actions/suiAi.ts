import { z } from "zod";
import { ActionResponse } from "@/types/actions";
import { SuiAiPools } from "@/types/suiai";
import { getSuiAiPools as getSuiAiPoolsAction } from "@/server/actions/sui-ai";

const getSuiAiTopPoolsSchema = z.object({
    sortBy: z.enum(["marketcap", "volume_24h"]).default("volume_24h").describe("Sort pools by market cap or 24-hour volume"),
    // limit: z.number().min(1).max(25).default(20).describe("Number of top pools to return. Maximum 25."),
});

export type GetSuiAiTopPoolsSchema = z.infer<typeof getSuiAiTopPoolsSchema>;
export type GetSuiAiTopPoolsResponse = ActionResponse<{
    pools: SuiAiPools[];
    sortedBy: string;
}>;

export const getSuiAiPools = {
    description: "Get top SUI AI pools sorted by market cap or 24-hour volume. By default, pools are sorted by 24-hour volume when no sorting preference is specified. Use this to analyze trending AI tokens on the SUI network.",
    parameters: getSuiAiTopPoolsSchema,
    execute: async ({ sortBy }: GetSuiAiTopPoolsSchema): Promise<GetSuiAiTopPoolsResponse> => {
        try {
            const response = await getSuiAiPoolsAction({
                sort: sortBy,
                // page: 1,
                // pageSize: limit
            });

            if (!response || !response.data?.success || !response.data?.data || !response.data?.data?.length) {
                return {
                    success: false,
                    error: "Failed to fetch SUI AI pools",
                };
            }

            return {
                success: true,
                data: {
                    pools: response.data.data,
                    sortedBy: sortBy,
                },
            };
        } catch (error) {
            console.error("Error fetching SUI AI pools:", error);
            return {
                success: false,
                error: "Failed to fetch SUI AI pools",
            };
        }
    }
};