import { searchTokenDetails } from "../actions/searchTokenDetails";
import { getTokenFromRegistry } from "./getTokenFromRegistry";

export const searchTokenAddress = async (query: string) => {
    try {
        const res = await getTokenFromRegistry(query);
        if (res) {
            return res.address;
        }
        
        const res2 = await searchTokenDetails.execute({ query });
        if (res2?.data?.address) {
            return res2.data?.address;
        }

        return;
    } catch (error) {
        console.error('Error searching for token address', error);
        return null;
    }
}