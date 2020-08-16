# react-easy-auto-complete-input

> Easy to create an input with suggest list. Can use on input text or textarea. Trigger showing suggest list by special character such as: @, [, ... anything you like

[![NPM](https://img.shields.io/npm/v/react-easy-auto-complete-input.svg)](https://www.npmjs.com/package/react-easy-auto-complete-input) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-easy-auto-complete-input
```

## Test
```bash
npm test
```

## Usage

```css
.item {
  display: flex;
  padding: 3px;
}

.item > div {
  flex: 1
}

.item:hover {
  background-color: gray;
}

.item-code {
  text-align: right;
}

.hovered {
  background-color: gray;
}
```

```tsx
import React, { Component } from 'react'

import MyComponent from 'react-easy-auto-complete-input'
import 'react-easy-auto-complete-input/dist/index.css'

type Country = {
  Code: string;
  Name: string;
}

class Example extends Component {
  render() {
    const items: Country[] =[
      {"Code": "AF", "Name": "Afghanistan"},
      {"Code": "AX", "Name": "land Islands"},
      {"Code": "AL", "Name": "Albania"},
      {"Code": "VN", "Name": "Vietnam"}
    ];

    return <AutoComplete
                type='textarea'
                style={{ lineHeight: '22px' }}
                activeKey='@'
                filterBy='Name'
                items={items}
                formatSelectedItem={(item: StandardItem<Country>) => `__${item.params.Name}__`}
            >
              {
                (item: StandardItem<Country>) => {
                  return (
                    <div className={`item ${item.hovered ? 'hovered': ''}`}>
                      <div>
                      {item.params.Name}
                      </div>
                      <div className='item-code'>
                      {item.params.Code}
                      </div>
                    </div>
                  )
                }
              }
            </AutoComplete>
  }
}
```

## Images Result
Trigger showwing  suggest list by '@':
![trigger-showing-suggest-list](/assets/trigger-showing-suggest-list.png)

Continue entering will filter items:
![filter](/assets/filter.png)

Press enter or click on item which you want:
![select-item](/assets/select-item.png)

## Demo
```
cd example && npm install && npm start
```

## Props
WIP
|  # |  Name | Required | Default | Description
|---|---|---|---|---|
|  |   |


## License

MIT © [huytd](https://github.com/huytd)
