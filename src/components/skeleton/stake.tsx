import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpDown, ChevronDown } from "lucide-react";

export function StakeSkeleton() {
    return (
        <div className="relative z-[1] flex flex-col items-center w-[400px]">
            <div className="flex w-full max-w-md flex-col items-center gap-8">
                <div className="flex w-full flex-col gap-4">
                    <Card>
                        <div className="relative flex w-full flex-col items-center gap-2 p-2 md:gap-4 md:p-4">
                            {/* Input skeleton */}
                            <div className="relative z-[1] w-full">
                                <div className="flex w-full flex-col rounded-md bg-background p-4">
                                    <p className="text-p2 text-navy-600">In</p>
                                    <div className="flex w-full flex-row items-center justify-between">
                                        <Skeleton className="h-9 w-[60%] mb-1" />
                                        <Skeleton className="h-8 w-24 rounded-full" />
                                    </div>
                                    <div className="flex w-full flex-row items-center justify-between">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                            </div>

                            {/* Arrow button */}
                            <div className="group relative z-[2] -my-5 rounded-[50%] bg-navy-100 p-2 md:-my-7 bg-primary">
                                <ArrowUpDown className="h-4 w-4 text-navy-600" />
                            </div>

                            {/* Output skeleton */}
                            <div className="relative z-[1] w-full">
                                <div className="flex w-full flex-col rounded-md bg-background p-4">
                                    <p className="text-p2 text-navy-600">Out</p>
                                    <div className="flex w-full flex-row items-center justify-between">
                                        <Skeleton className="h-9 w-[60%] mb-1" />
                                        <Skeleton className="h-8 w-24 rounded-full" />
                                    </div>
                                    <div className="flex w-full flex-row items-center justify-between">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                            </div>

                            {/* More info section */}
                            <div className="flex flex-col w-full bg-background rounded-md">
                                <div className="flex w-full flex-row items-center justify-between p-2">
                                    <p className="text-sm font-medium text-primary-foreground">More info</p>
                                    <ChevronDown className="h-5 w-5 text-primary-foreground" />
                                </div>
                            </div>

                            {/* Button skeletons */}
                            <div className="flex w-full flex-col items-center gap-2">
                                <Skeleton className="h-10 w-full rounded-md bg-background" />
                                <Skeleton className="h-9 w-full rounded-md bg-background" />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
