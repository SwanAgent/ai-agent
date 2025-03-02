"use server";

import { z } from "zod";
import { ActionResponse, actionClient } from "@/lib/safe-action";
import { SuiAiPools } from "@/types/suiai";

const SUIAI_API_BASE = "https://api.suiai.fun/api";

const sortSchema = z.enum(["marketcap", "volume_24h"]);

export const getSuiAiPools = actionClient
  .schema(
    z.object({ 
      sort: sortSchema.default("volume_24h"),
      page: z.number().default(1), 
      pageSize: z.number().default(15) 
    })
  )
  .action<ActionResponse<SuiAiPools[]>>(
    async ({ parsedInput: { sort, page, pageSize } }) => {
      try {
        const response = await fetch(
          `${SUIAI_API_BASE}/pools?populate=*&sort=${sort}:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}`
        );
        const data = await response.json();
        
        if (!data?.data) {
          return {
            success: false,
            error: "Failed to fetch pools",
          };
        }

        return {
          success: true,
          data: data.data,
        };
      } catch (error) {
        console.error("Error fetching pools:", error);
        return {
          success: false,
          error: "Failed to fetch pools",
        };
      }
    }
  );