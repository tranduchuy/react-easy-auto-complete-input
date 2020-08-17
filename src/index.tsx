import * as React from 'react';
import ReactDOM from 'react-dom';
import styles from './styles.module.css';
import getCaretCoordinates from 'textarea-caret';

type InputProps = {};

type TextareaProps = {
    rows?: number;
    cols?: number;
};

export type FilterByFn = (item: StandardItem<AutoCompleteItem>) => boolean;

type SuggestListProps = {
    activeKey: string;
    filterBy: string | FilterByFn;
    formatSelectedItem: (item: StandardItem) => string;
    onSelect?: (item: AutoCompleteItem) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AutoCompleteItem = any;

export interface StandardItem<T = AutoCompleteItem> {
    id: string;
    selected: boolean;
    hovered: boolean;
    params: T;
}

export type Props = {
    type: 'input' | 'textarea';
    value?: string;
    items: AutoCompleteItem[];
    children: (item: StandardItem) => JSX.Element;
    onChanged?: (value: string) => void;
    className?: string;
    style?: React.CSSProperties;
    dropdownClass?: string;
} & SuggestListProps &
    InputProps &
    TextareaProps;

export type State = {
    show: boolean;
    hoverOnIndex: number;
    filteredItems: StandardItem[];
};

const KEY_UP = 38;
const KEY_DOWN = 40;
const ESC = 27;
const SHIFT = 16;
const ENTER = 13;

export const AC_CONTAINER_CLASSNAME = 'auto-complete-container';

export class AutoComplete extends React.Component<Props, State> {
    public static defaultProps = {
        filterBy: 'name',
        type: 'textarea',
        value: '',
        multiChoice: true,
    };

    slRefContainer: HTMLDivElement | null = null;
    slRef = React.createRef<HTMLDivElement>();
    inputRef = React.createRef<HTMLInputElement>();
    textareRef = React.createRef<HTMLTextAreaElement>();
    standardItems: StandardItem[] = [];
    caretCursorIndex = -1;

    constructor(props: Props) {
        super(props);

        this.standardItems = props.items.map((i, index) => {
            return {
                id: 'item_' + index.toString(),
                selected: false,
                hovered: false,
                params: i,
            };
        });

        this.state = {
            show: false,
            hoverOnIndex: -1,
            filteredItems: this.standardItems,
        };

        this._checkContainerExist();
    }

    componentDidMount(): void {
        this._initInputValue(this.props.value || '');
    }

    componentDidUpdate(prevProps: Props): void {
        if (prevProps.value !== this.props.value) {
            this._initInputValue(this.props.value || '');
        }
    }

    private _initInputValue(value: string): void {
        const input: HTMLInputElement | HTMLTextAreaElement | null = this.textareRef.current || this.inputRef.current;

        if (!input) {
            return;
        }

        input.value = value;
    }

    private _checkContainerExist(): void {
        let div = document.getElementById(AC_CONTAINER_CLASSNAME) as HTMLDivElement;

        if (div === null) {
            div = document.createElement('div');
            div.id = AC_CONTAINER_CLASSNAME;
            document.body.append(div);
        }

        this.slRefContainer = div;
    }

    private _optimizePosition = (): void => {
        if (!this.slRef.current) {
            console.log(-1);
            return;
        }

        const input: HTMLInputElement | HTMLTextAreaElement | null = this.textareRef.current || this.inputRef.current;

        if (!input) {
            return;
        }

        if (input.selectionEnd === null) {
            console.warn('Caret position is -1');
            return;
        }

        this.caretCursorIndex = input.selectionEnd;
        const bounding = input.getBoundingClientRect();
        const caretPosition = getCaretCoordinates(input, this.caretCursorIndex);
        let newTop = bounding.top + caretPosition.top + (caretPosition.height || 18);
        let newLeft = bounding.left + caretPosition.left;
        this.slRef.current.style.opacity = '0';

        // detect direction by window height and width

        if (newLeft + this.slRef.current.offsetWidth > window.innerWidth) {
            newLeft = window.innerWidth - this.slRef.current.offsetWidth;
        }

        // console.log(caretPosition.top)
        if (newTop + this.slRef.current.offsetHeight > window.innerHeight) {
            newTop = bounding.top + caretPosition.top - 5 - this.slRef.current.offsetHeight;
        }

        this.slRef.current.style.top = `${newTop}px`;
        this.slRef.current.style.left = `${newLeft}px`;

        if (this.slRef.current) {
            this.slRef.current.style.opacity = '1';
        }
    };

    private _showSuggestList(): void {
        this.setState(
            {
                show: true,
            },
            this._optimizePosition
        );
    }

    private _hideSuggestList(): void {
        this.caretCursorIndex = -1;
        this.setState({
            show: false,
            filteredItems: JSON.parse(JSON.stringify(this.standardItems)),
            hoverOnIndex: -1,
        });
    }

    private _moveUp(): void {
        this.setState((prevState) => {
            const hoverOnIndex = prevState.hoverOnIndex > 0 ? prevState.hoverOnIndex - 1 : 0;
            return {
                ...prevState,
                hoverOnIndex,
                filteredItems: prevState.filteredItems
                    .map((i) => JSON.parse(JSON.stringify(i)))
                    .map((i, index) => {
                        i.hovered = hoverOnIndex === index;
                        return i;
                    }),
            };
        });
    }

    private _moveDown(): void {
        const { filteredItems } = this.state;
        const maxIndex = filteredItems.length - 1;
        this.setState((prevState) => {
            const hoverOnIndex = prevState.hoverOnIndex < maxIndex ? prevState.hoverOnIndex + 1 : maxIndex;
            return {
                ...prevState,
                hoverOnIndex,
                filteredItems: prevState.filteredItems
                    .map((i) => JSON.parse(JSON.stringify(i)))
                    .map((i, index) => {
                        i.hovered = hoverOnIndex === index;
                        return i;
                    }),
            };
        });
    }

    private _selectOnPressEnter(): void {
        const { hoverOnIndex, filteredItems } = this.state;
        const input: HTMLInputElement | HTMLTextAreaElement | null = this.textareRef.current || this.inputRef.current;

        if (!input || input.selectionEnd === null) {
            return;
        }

        const selectedItem = filteredItems[hoverOnIndex];
        if (!selectedItem) {
            return;
        }

        if (this.props.onSelect) {
            this.props.onSelect(selectedItem.params);
        }

        input.value =
            input.value.slice(0, this.caretCursorIndex - 1) +
            this.props.formatSelectedItem(selectedItem) +
            input.value.slice(input.selectionEnd);
        if (this.props.onChanged) {
            this.props.onChanged(input.value);
        }

        this._hideSuggestList();
    }

    private _selectOnClick(selectedItem: StandardItem): void {
        const input: HTMLInputElement | HTMLTextAreaElement | null = this.textareRef.current || this.inputRef.current;

        if (!input || input.selectionEnd === null) {
            return;
        }

        if (this.props.onSelect) {
            this.props.onSelect(selectedItem.params);
        }

        input.value =
            input.value.slice(0, this.caretCursorIndex - 1) +
            this.props.formatSelectedItem(selectedItem) +
            input.value.slice(input.selectionEnd);
        if (this.props.onChanged) {
            this.props.onChanged(input.value);
        }

        this._hideSuggestList();
    }

    private _filter(txt: string): StandardItem[] {
        const { filterBy } = this.props;
        if (typeof filterBy === 'string') {
            return this.standardItems
                .filter((i) => i.params[filterBy].toString().toLowerCase().indexOf(txt) > -1)
                .map((i) => JSON.parse(JSON.stringify(i)))
                .map((i) => {
                    i.hovered = false;
                    return i;
                });
        }

        return this.standardItems
            .map((i) => JSON.parse(JSON.stringify(i)))
            .filter((i) => filterBy(i.params))
            .map((i) => {
                i.hovered = false;
                return i;
            });
    }

    private _getJustInputedChars(): string {
        const input: HTMLInputElement | HTMLTextAreaElement | null = this.textareRef.current || this.inputRef.current;

        if (!input || input.selectionEnd === null) {
            return '';
        }

        const start = this.caretCursorIndex;
        const end = input.selectionEnd;
        // -1 is used to return active char
        return input.value.slice(start - 1, end);
    }

    private _onKeyUp = (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        if (this.props.activeKey === event.key) {
            this._showSuggestList();
            return;
        }
        const { show } = this.state;

        switch (event.which) {
            case KEY_UP:
                if (show) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            case KEY_DOWN:
                if (show) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            case ESC:
                if (show) {
                    event.preventDefault();
                    event.stopPropagation();
                    console.log(1);
                }
                // close suggest list
                break;
            case SHIFT:
                break;
            case ENTER:
                if (show) {
                    event.preventDefault();
                    event.stopPropagation();
                    this._selectOnPressEnter();
                }
                break;
            default:
                if (show) {
                    const text = this._getJustInputedChars();
                    if (text === '') {
                        this._hideSuggestList();
                    } else {
                        // TODO: re filter items
                        const newFilteredList = this._filter(text.slice(1).toLowerCase());
                        if (newFilteredList.length > 0) {
                            newFilteredList[0].hovered = true;
                        }
                        this.setState({
                            filteredItems: newFilteredList,
                            hoverOnIndex: 0,
                        });
                    }
                }
                break;
        }
    };

    private _onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        const { show } = this.state;
        console.log('down', event.which);
        switch (event.which) {
            case KEY_UP:
                if (show) {
                    event.preventDefault();
                    this._moveUp();
                }
                break;
            case KEY_DOWN:
                if (show) {
                    event.preventDefault();
                    this._moveDown();
                }
                break;
        }
    };

    private _onChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        if (this.props.onChanged) {
            this.props.onChanged(event.currentTarget.value);
        }
    };

    render(): JSX.Element {
        const { type, className, dropdownClass, cols, rows, style, children } = this.props;
        const { show, filteredItems } = this.state;
        return (
            <React.Fragment>
                {type === 'input' ? (
                    <input
                        style={style}
                        ref={this.inputRef}
                        type="text"
                        className={className}
                        onKeyUp={this._onKeyUp}
                        onKeyDown={this._onKeyDown}
                        onChange={this._onChange}
                    />
                ) : (
                    <textarea
                        style={style}
                        ref={this.textareRef}
                        className={className}
                        rows={rows}
                        cols={cols}
                        onKeyUp={this._onKeyUp}
                        onKeyDown={this._onKeyDown}
                        onChange={this._onChange}
                    />
                )}

                {this.slRefContainer &&
                    ReactDOM.createPortal(
                        <div
                            ref={this.slRef}
                            className={`ac-wrap ${dropdownClass || ''} ${styles.wrap} ${!show ? styles.hide : ''}`}
                        >
                            {filteredItems.map((i) => {
                                return (
                                    <div key={i.id} onClick={(): void => this._selectOnClick(i)}>
                                        {children(i)}
                                    </div>
                                );
                            })}
                        </div>,
                        this.slRefContainer as Element
                    )}
            </React.Fragment>
        );
    }
}
