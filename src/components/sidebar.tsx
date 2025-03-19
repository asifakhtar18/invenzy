"use c"
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";
import { BarChart3, ClipboardList, Package, Settings, Users } from "lucide-react";

export default function Sidebar() {
    const { user } = useAuth()
    const pathname = usePathname()

    const navItems = [
        {
            href: "/",
            icon: BarChart3,
            label: "Dashboard",
        },
        {
            href: "/inventory",
            icon: Package,
            label: "Inventory",
        },
        {
            href: "/staff",
            icon: Users,
            label: "Staff",
            adminOnly: true,
        },
        // {
        //     href: "/activity",
        //     icon: ClipboardList,
        //     label: "Activity Log",
        // },

        {
            href: "/settings",
            icon: Settings,
            label: "Settings",
            adminOnly: true,
        },

    ]

    const filteredNavItems = navItems.filter((item) => !item.adminOnly || user?.role === "admin")
    return (
        <aside className="  w-[250px] z-3 top-16 shrink-0 fixed h-full flex-col border-r bg-muted/40 md:flex">
            <nav className="grid items-start px-2 py-4 text-sm">
                {filteredNavItems?.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-primary",
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute inset-0 rounded-lg bg-primary/10"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                />
                            )}
                            <item.icon className="h-4 w-4" />
                            <span className="relative">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}