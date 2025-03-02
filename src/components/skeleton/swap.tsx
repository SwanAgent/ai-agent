import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowDown } from 'lucide-react';

export function SwapSkeleton() {
    return (
        <Card className={cn('mt-3 overflow-hidden min-w-[384px]')}>
            <CardHeader className="border-b w-full">
                <CardTitle className="flex items-center justify-between">
                    <span>Swap</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-6">
                    {/* From Token */}
                    <div className="flex flex-col gap-4">
                        <span className="text-xs text-muted-foreground">You Pay</span>
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex flex-col gap-1">
                                <Skeleton className="w-32 h-5" />
                                <Skeleton className="w-16 h-3" />
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex w-full justify-center my-3">
                            <ArrowDown className="w-5 h-5 text-muted-foreground" />
                        </div>

                        {/* To Token */}
                        <span className="text-xs text-muted-foreground">You Receive</span>
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex flex-col gap-1">
                                <Skeleton className="w-32 h-5" />
                                <Skeleton className="w-16 h-3" />
                            </div>
                        </div>
                    </div>

                    {/* Swap Button */}
                    <Skeleton className="w-full h-10" />

                    {/* Powered by text */}
                    <div className="flex justify-center">
                        <Skeleton className="w-32 h-3" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
