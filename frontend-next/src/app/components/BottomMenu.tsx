"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomMenuProps {
    likedItemsCount: number;
    isHidden?: boolean;
}

export default function BottomMenu({ likedItemsCount, isHidden }: BottomMenuProps) {
    const pathname = usePathname();

    return (
        <nav className={`bottom-menu${isHidden ? ' bottom-menu--hidden' : ''}`}>
            <Link href="/" className={`bottom-menu-item ${pathname === '/' ? 'active' : ''}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <p>Поиск</p>
            </Link>
            <Link href="/wishlist" className={`bottom-menu-item ${pathname === '/wishlist' ? 'active' : ''}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0 -7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0 -7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                <p>Вишлисты</p>
                {likedItemsCount > 0 && (
                    <span className="liked-items-count">{likedItemsCount}</span>
                )}
            </Link>
            <Link href="/account" className={`bottom-menu-item ${pathname === '/account' ? 'active' : ''}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0 -4-4H8a4 4 0 0 0 -4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <p>Аккаунт</p>
            </Link>
        </nav>
    );
} 