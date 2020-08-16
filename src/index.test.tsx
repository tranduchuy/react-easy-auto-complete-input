/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */


import React from 'react';
import { AutoComplete, StandardItem, Props, State, AutoCompleteItem } from '.';
import Enzyme, { mount, ReactWrapper } from 'enzyme';
import EnzymeToJson from 'enzyme-to-json';

import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

type User = {
    name: string;
};

const items: User[] = [
    { name: 'US' },
    { name: 'England' },
    { name: 'Germany' }
];

const mountComp = (
    type?: 'textarea' | 'input'
): ReactWrapper<Props, State, AutoComplete> => {
    return mount(
        <AutoComplete
            activeKey='['
            filterBy='name'
            items={items}
            type={type || 'textarea'}
            formatSelectedItem={(item: StandardItem<User>): string =>
                `__${item.params.name}__`
            }
            children={(item: StandardItem<User>): JSX.Element => {
                return <div>{item.params.name}</div>;
            }}
        />
    );
};

describe('AutoComplete', () => {
    describe('Textarea', () => {
        it('is truthy', () => {
            const component = mountComp();
            expect(AutoComplete).toBeTruthy();
            expect(EnzymeToJson(component)).toMatchSnapshot();
        });

        it('Init succesfully', () => {
            const props: Props = {
                type: 'textarea',
                activeKey: '[',
                children: (item: StandardItem<User>): JSX.Element => {
                    return <div>{item.params.name}</div>;
                },
                filterBy: 'name',
                items: [],
                value: 'hello world',
                onSelect: jest.fn((_items: AutoCompleteItem): void => {}),
                onChanged: jest.fn((_value: string) => {}),
                formatSelectedItem: (item: StandardItem<User>): string =>
                    `__${item.params.name}__`
            };
            const component: ReactWrapper<Props, State, AutoComplete> = mount(
                <AutoComplete {...props} />
            );
            const textarea = component.instance().textareRef.current;
            if (textarea) {
                expect(textarea.value).toEqual('hello world');
            }

            expect(props.onChanged).not.toHaveBeenCalled();
            expect(props.onSelect).not.toHaveBeenCalled();
        });

        it('Not call onChanged when pass new props.value', () => {
            const props: Props = {
                type: 'textarea',
                activeKey: '[',
                children: (item: StandardItem<User>): JSX.Element => {
                    return <div>{item.params.name}</div>;
                },
                filterBy: 'name',
                items: [],
                value: 'hello world',
                onSelect: jest.fn((_items: AutoCompleteItem): void => {}),
                onChanged: jest.fn((value: string) => {}),
                formatSelectedItem: (item: StandardItem<User>): string =>
                    `__${item.params.name}__`
            };
            const component: ReactWrapper<Props, State, AutoComplete> = mount(
                <AutoComplete {...props} />
            );
            let textarea = component.instance().textareRef.current;
            if (textarea) {
                expect(textarea.value).toEqual('hello world');
            }

            component.setProps({
                value: 'abc xyz'
            });
            textarea = component.instance().textareRef.current;
            if (textarea) {
                expect(textarea.value).toEqual('abc xyz');
            }

            expect(props.onChanged).not.toHaveBeenCalled();
        });

        it('Show suggest list on input activeKey', () => {
            const component = mountComp();
            const beforeEl = component.find('.ac-wrap').get(0);
            expect(beforeEl.props.className).toContain('hide');

            const textarea = component.instance().textareRef.current;
            if (textarea) {
                textarea.focus();
                textarea.setSelectionRange(0, 0, 'forward');
            }

            component.find('textarea').simulate('keyup', { key: '[' });
            component.update();
            const afterEl = component.find('.ac-wrap').get(0);
            expect(afterEl.props.className).not.toContain('hide');
        });

        it('Should call onChanged when input text', () => {
            const props: Props = {
                type: 'textarea',
                activeKey: '[',
                children: (item: StandardItem<User>): JSX.Element => {
                    return <div>{item.params.name}</div>;
                },
                filterBy: 'name',
                items,
                onChanged: jest.fn((_value: string) => {}),
                formatSelectedItem: (item: StandardItem<User>): string =>
                    `__${item.params.name}__`
            };
            const component: ReactWrapper<Props, State, AutoComplete> = mount(
                <AutoComplete {...props} />
            );

            const textarea = component.instance().textareRef.current;
            if (textarea) {
                textarea.value = 'Test value [asdasd]';
            }

            component.find('textarea').simulate('change', {});
            expect(props.onChanged).toHaveBeenCalledTimes(1);
            expect(props.onChanged).toHaveBeenCalledWith('Test value [asdasd]');
        });

        it('Should call onChanged when click item in suggest list', () => {
            const props: Props = {
                type: 'textarea',
                activeKey: '[',
                children: (item: StandardItem<User>): JSX.Element => {
                    return <div>{item.params.name}</div>;
                },
                filterBy: 'name',
                items,
                onSelect: jest.fn((_items: AutoCompleteItem): void => {}),
                onChanged: jest.fn((value: string) => {}),
                formatSelectedItem: jest.fn(
                    (item: StandardItem<User>): string =>
                        `__${item.params.name}__`
                )
            };
            const component: ReactWrapper<Props, State, AutoComplete> = mount(
                <AutoComplete {...props} />
            );
            const textarea = component.instance().textareRef.current;
            if (textarea) {
                textarea.value = '';
                textarea.focus();
                textarea.setSelectionRange(0, 0, 'forward');
            }

            const item = component.find('.ac-wrap>div').at(1);
            item.simulate('click', {});

            expect(props.onSelect).toHaveBeenCalledTimes(1);
            expect(props.onSelect).toHaveBeenCalledWith(items[1]);
            expect(props.onChanged).toHaveBeenCalledTimes(1);
            expect(props.onChanged).toHaveBeenCalledWith('__England__');
            expect(props.formatSelectedItem).toHaveBeenCalledTimes(1);
        });

        it('Should call onChanged when press enter on item in suggest list', () => {
            const props: Props = {
                type: 'textarea',
                activeKey: '[',
                children: (item: StandardItem<User>): JSX.Element => {
                    return <div>{item.params.name}</div>;
                },
                filterBy: 'name',
                items,
                onSelect: jest.fn((_items: AutoCompleteItem): void => {}),
                onChanged: jest.fn((_value: string) => {}),
                formatSelectedItem: jest.fn(
                    (item: StandardItem<User>): string =>
                        `__${item.params.name}__`
                )
            };
            const component: ReactWrapper<Props, State, AutoComplete> = mount(
                <AutoComplete {...props} />
            );

            const textarea = component.instance().textareRef.current;
            if (textarea) {
                textarea.value = '';
                textarea.focus();
                textarea.setSelectionRange(0, 0, 'forward');
            }
            component.setState(
                {
                    show: true,
                    hoverOnIndex: 1
                },
                () => {
                    component.find('textarea').simulate('keyup', {
                        which: 13
                    });

                    expect(props.onSelect).toHaveBeenCalledTimes(1);
                    expect(props.onSelect).toHaveBeenCalledWith(items[1]);
                    expect(props.formatSelectedItem).toHaveBeenCalledTimes(1);
                    expect(props.onChanged).toHaveBeenCalledTimes(1);
                    expect(props.onChanged).toHaveBeenCalledWith(
                        `__${items[1].name}__`
                    );
                }
            );
        });
    });

    describe('Input', () => {
        it('is truthy', () => {
            const component = mountComp();
            expect(AutoComplete).toBeTruthy();
            expect(EnzymeToJson(component)).toMatchSnapshot();
        });

        it('Init succesfully', () => {
            const props: Props = {
                type: 'textarea',
                activeKey: '[',
                children: (item: StandardItem<User>): JSX.Element => {
                    return <div>{item.params.name}</div>;
                },
                filterBy: 'name',
                items: [],
                value: 'hello world',
                onSelect: jest.fn((_items: AutoCompleteItem): void => {}),
                onChanged: jest.fn((value: string) => {}),
                formatSelectedItem: (item: StandardItem<User>): string =>
                    `__${item.params.name}__`
            };
            const component: ReactWrapper<Props, State, AutoComplete> = mount(
                <AutoComplete {...props} />
            );
            const input = component.instance().inputRef.current;
            if (input) {
                expect(input.value).toEqual('hello world');
            }

            expect(props.onChanged).not.toHaveBeenCalled();
            expect(props.onSelect).not.toHaveBeenCalled();
        });

        it('Not call onChanged when pass new props.value', () => {
            const props: Props = {
                type: 'textarea',
                activeKey: '[',
                children: (item: StandardItem<User>): JSX.Element => {
                    return <div>{item.params.name}</div>;
                },
                filterBy: 'name',
                items: [],
                value: 'hello world',
                onSelect: jest.fn((_items: AutoCompleteItem): void => {}),
                onChanged: jest.fn((value: string) => {}),
                formatSelectedItem: (item: StandardItem<User>): string =>
                    `__${item.params.name}__`
            };
            const component: ReactWrapper<Props, State, AutoComplete> = mount(
                <AutoComplete {...props} />
            );
            let input = component.instance().inputRef.current;
            if (input) {
                expect(input.value).toEqual('hello world');
            }

            component.setProps({
                value: 'abc xyz'
            });
            input = component.instance().inputRef.current;
            if (input) {
                expect(input.value).toEqual('abc xyz');
            }

            expect(props.onChanged).not.toHaveBeenCalled();
        });

        it('Show suggest list on input activeKey', () => {
            const component = mountComp('input');
            const beforeEl = component.find('.ac-wrap').get(0);
            expect(beforeEl.props.className).toContain('hide');

            const input = component.instance().inputRef.current;
            if (input) {
                input.focus();
                input.setSelectionRange(0, 0, 'forward');
            }

            component.find('input').simulate('keyup', { key: '[' });
            component.update();
            const afterEl = component.find('.ac-wrap').get(0);
            expect(afterEl.props.className).not.toContain('hide');
        });

        it('Should call onChanged when input text', () => {
            const props: Props = {
                type: 'input',
                activeKey: '[',
                children: (item: StandardItem<User>): JSX.Element => {
                    return <div>{item.params.name}</div>;
                },
                filterBy: 'name',
                items,
                onChanged: jest.fn((_value: string) => {}),
                formatSelectedItem: (item: StandardItem<User>): string =>
                    `__${item.params.name}__`
            };
            const component: ReactWrapper<Props, State, AutoComplete> = mount(
                <AutoComplete {...props} />
            );

            const input = component.instance().inputRef.current;
            if (input) {
                input.value = 'Test value [asdasd]';
            }

            component.find('input').simulate('change', {});
            expect(props.onChanged).toHaveBeenCalledTimes(1);
            expect(props.onChanged).toHaveBeenCalledWith('Test value [asdasd]');
        });

        it('Should call onChange when click item in suggest list', () => {
            const props: Props = {
                type: 'textarea',
                activeKey: '[',
                children: (item: StandardItem<User>): JSX.Element => {
                    return <div>{item.params.name}</div>;
                },
                filterBy: 'name',
                items,
                onSelect: jest.fn((_items: AutoCompleteItem): void => {}),
                onChanged: jest.fn((value: string) => {}),
                formatSelectedItem: jest.fn(
                    (item: StandardItem<User>): string =>
                        `__${item.params.name}__`
                )
            };
            const component: ReactWrapper<Props, State, AutoComplete> = mount(
                <AutoComplete {...props} />
            );
            const input = component.instance().inputRef.current;
            if (input) {
                input.value = '';
                input.focus();
                input.setSelectionRange(0, 0, 'forward');
            }

            const item = component.find('.ac-wrap>div').at(1);
            item.simulate('click', {});

            expect(props.onSelect).toHaveBeenCalledTimes(1);
            expect(props.onSelect).toHaveBeenCalledWith(items[1]);
            expect(props.onChanged).toHaveBeenCalledTimes(1);
            expect(props.onChanged).toHaveBeenCalledWith('__England__');
            expect(props.formatSelectedItem).toHaveBeenCalledTimes(1);
        });

        it('Should call onChange when press enter on item in suggest list', () => {
            const props: Props = {
                type: 'input',
                activeKey: '[',
                children: (item: StandardItem<User>): JSX.Element => {
                    return <div>{item.params.name}</div>;
                },
                filterBy: 'name',
                items,
                onSelect: jest.fn((_items: AutoCompleteItem): void => {}),
                onChanged: jest.fn((value: string) => {}),
                formatSelectedItem: jest.fn(
                    (item: StandardItem<User>): string =>
                        `__${item.params.name}__`
                )
            };
            const component: ReactWrapper<Props, State, AutoComplete> = mount(
                <AutoComplete {...props} />
            );

            const input = component.instance().inputRef.current;
            if (input) {
                input.value = '';
                input.focus();
                input.setSelectionRange(0, 0, 'forward');
            }
            component.setState(
                {
                    show: true,
                    hoverOnIndex: 1
                },
                () => {
                    component.find('input').simulate('keyup', {
                        which: 13
                    });

                    expect(props.onSelect).toHaveBeenCalledTimes(1);
                    expect(props.onSelect).toHaveBeenCalledWith(items[1]);
                    expect(props.formatSelectedItem).toHaveBeenCalledTimes(1);
                    expect(props.onChanged).toHaveBeenCalledTimes(1);
                    expect(props.onChanged).toHaveBeenCalledWith(
                        `__${items[1].name}__`
                    );
                }
            );
        });
    });
});
