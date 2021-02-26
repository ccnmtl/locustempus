import React from 'react';

export const LoadingModal: React.FC = () => {
    return (
        <div className={'loading-modal'} data-cy={'loading-modal'}>
            <div className='loading-modal__indicator'></div>
            <div className='loading-modal__text'>Loading...</div>
        </div>
    );
};
