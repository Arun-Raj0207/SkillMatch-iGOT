import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

const TabsContext = createContext(null);
function Tabs({ defaultValue, value: controlledValue, onValueChange, children, className }) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlledValue ?? internal;
  const setValue = (next) => { setInternal(next); onValueChange?.(next); };
  return <TabsContext.Provider value={{ value, setValue }}><div className={className}>{children}</div></TabsContext.Provider>;
}
function TabsList({ className, ...props }) { return <div className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)} {...props} />; }
function TabsTrigger({ value, className, ...props }) { const ctx = useContext(TabsContext); return <button type="button" onClick={() => ctx.setValue(value)} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all", ctx.value === value && "bg-background text-foreground shadow", className)} {...props} />; }
function TabsContent({ value, className, ...props }) { const ctx = useContext(TabsContext); if (ctx.value !== value) return null; return <div className={cn("mt-2", className)} {...props} />; }
export { Tabs, TabsList, TabsTrigger, TabsContent };
