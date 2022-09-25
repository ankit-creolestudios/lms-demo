import React, { Component } from 'react';
import { FileImage } from 'src/components/ApiFile';
interface IProps {
    rows: any[];
    onItemClick: any;
    activeItemIndex: number[] | null;
    viewedNodes: string[];
}
interface IMnemonicsRow {
    image: string;
    title: string;
}
export default class MnemonicList extends Component<IProps> {
    render() {
        if (!this.props?.rows?.length) {
            return <></>;
        }
        const { rows, onItemClick, activeItemIndex, viewedNodes } = this.props;

        return (
            <div className='rows'>
                {rows.map((row, rowIndex) => (
                    <div key={rowIndex} className='row'>
                        {row.map((row: IMnemonicsRow, itemIndex: number) =>
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
