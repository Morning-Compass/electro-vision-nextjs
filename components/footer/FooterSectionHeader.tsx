import Link from "next/link"
import {ReactNode} from "react";

export type FooterSectionHeaderProps = {
    children: ReactNode;
    link?: string | undefined;
    [key: string]: unknown;
}

export function FooterSectionHeader({children, link = undefined, ...props}: FooterSectionHeaderProps) {
    return (
        <Link className="duration-300 font-bold mb-1 hover:text-emerald-500" href={link ?? ""} {...props}>
            {children}
        </Link>
    );
}