import React, { useState, useRef, useEffect, ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

interface MenuItem {
    handler(): void;
    icon: ReactElement;
    label: string;
}

interface OverflowMenuProps {
    items: MenuItem[];
}

export const OverflowMenu: React.FC<OverflowMenuProps> = ({items}: OverflowMenuProps) => {

    const [showMenu, setShowMenu] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showMenu) {
            const closeMenu = (e: MouseEvent): void => {
                if (e.target instanceof Element && menuRef.current &&
                        !menuRef.current.contains(e.target)) {
                    setShowMenu(false);
                }
            };
            /* eslint-disable-next-line scanjs-rules/call_addEventListener */
            document.addEventListener('click', closeMenu);
            return () => {
                document.removeEventListener('click', closeMenu);
            };
        }
    }, [showMenu]);

    return (
        <div ref={menuRef} className={'lt-menu-overflow trailing'}>
            <button onClick={() => setShowMenu((prev) => !prev)}
                className={'lt-icon-button lt-icon-button--transparent'}
                aria-label={showMenu ?
                    'Hide more actions' : 'Show more actions'}>
                <span
                    className={'lt-icons lt-icon-button__icon'}
                    aria-hidden='true'>
                    <FontAwesomeIcon icon={faEllipsisV}/>
                </span>
            </button>
            {showMenu && (
                <div className={'lt-menu lt-menu-overflow--expand'}>
                    <ul className={'lt-list'} role='menu'>
                        {items.map((item, idx) => {
                            return (
                                <li className={'lt-list-item'} role='menuitem' key={idx}>
                                    <a href='#'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            item.handler();
                                            setShowMenu(false);}}
                                        className={'lt-list-item__link'}>
                                        <span
                                            className={'lt-icons lt-list-item__icon'}
                                            aria-hidden='true'>
                                            {item.icon}
                                        </span>
                                        <span
                                            className={'lt-list-item__primary-text'}>
                                            {item.label}
                                        </span>
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};
