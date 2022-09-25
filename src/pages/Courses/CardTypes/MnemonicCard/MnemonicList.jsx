import React, { Component } from 'react';
import { FileImage } from '../../../../components/ApiFile';

export default class MnemonicList extends Component {
    render() {
        if (!this.props?.rows?.length) {
            return <></>;
        }
        const { rows, onItemClick, activeItemIndex, viewedNodes } = this.props;

        return (
            <div className='lesson-cards__mnemonic-type__rows'>
                {rows.map((row, rowIndex) => (
                    <div key={rowIndex} className='lesson-cards__mnemonic-type__row'>
                        {row.map((row, itemIndex) =>
                            row.image ? (
                                <FileImage
                                    className={
                                        (activeItemIndex?.[0] === rowIndex && activeItemIndex?.[1] === itemIndex) ||
                                        viewedNodes.includes(`${rowIndex}-${itemIndex}`)
                                            ? 'active'
                                            : ''
                                    }
                                    onClick={onItemClick([rowIndex, itemIndex])}
                                    key={itemIndex}
                                    fileId={row.image}
                                />
                            ) : (
                                <span onClick={onItemClick([rowIndex, itemIndex])}>{row.title}</span>
                            )
                        )}
                    </div>
                ))}
            </div>
        );
    }
}

