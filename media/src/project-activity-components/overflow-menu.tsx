import React, { useState, ReactElement } from 'react';
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

    return (
        <div className='overflow-menu'>
            <button onClick={() => setShowMenu((prev) => !prev)}
                className='overflow-toggle'>
                <FontAwesomeIcon icon={faEllipsisV}/>
            </button>
            {showMenu && (
                <ul className='overflow-menu-show'>
                    {items.map((item, idx) => {
                        return (
                            <li key={idx}>
                                <a onClick={(e) => {
                                    e.preventDefault();
                                    item.handler();
                                    setShowMenu(false);}}>
                                    <span className='overflow-icon'>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </a>
                            </li>
                        );
                    })};
                </ul>
            )}
        </div>
    );
};
