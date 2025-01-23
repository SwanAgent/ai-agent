"use client";

import { AccountContent } from "./account-content";
import { SidebarToggle } from "@/components/sidebar-toggle";

export default function AccountPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background w-ful items-center relative">
            {/* <div className="absolute top-[6px] left-2">
                <SidebarToggle />
            </div> */}

            <div className="flex flex-col md:max-w-3xl w-full px-7 lg:px-0 text-5xl mt-10">
                Account
            </div>

            <div className="flex flex-col h-full md:max-w-3xl w-full items-center px-7 lg:px-0">
                {/* Page content */}
                <AccountContent />
            </div>
        </div>
    );
}
