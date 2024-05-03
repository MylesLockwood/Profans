import { useState } from 'react';
import {
  Input, Select, Image, Button
} from 'antd';
import {
  SearchOutlined
} from '@ant-design/icons';
import Router from 'next/router';
import { IUIConfig } from 'src/interfaces/index';
import {
  HEIGHTS, BODY_TYPES, ETHNICITIES, EYES, AGES, ORIENTATIONS, GENDERS, HAIRS, BUTTS
} from 'src/constants';
import './search-bar.less';

interface IProps {
  ui: IUIConfig
}

const SearchBar = ({ ui }: IProps) => {
  const [filterValue, setValue] = useState({ } as any);

  const onSearch = () => {
    Router.push({ pathname: '/content-creator', query: filterValue });
  };

  return (
    <div className="search-bar">
      <Input
        placeholder="Name, username, etc..."
        allowClear
        onChange={(e) => setValue({ ...filterValue, q: e.target.value })}
      />
      <div className="filter-block custom search">
        {/* <div className="filter-item">
          <Select
              // eslint-disable-next-line no-nested-ternary
            onChange={(val: any) => setValue({ ...filterValue, isFreeSubscription: val })}
            style={{ width: '100%' }}
            defaultValue=""
          >
            <Select.Option key="all" value="">
              All subscriptions
            </Select.Option>
            <Select.Option key="false" value="false">
              Non-free subscription
            </Select.Option>
            <Select.Option key="true" value="true">
              Free subscription
            </Select.Option>
          </Select>
        </div> */}
        {ui.countries && ui.countries.length > 0 && (
          <div className="filter-item">
            <Select
              onChange={(val) => setValue({ ...filterValue, country: val })}
              style={{ width: '100%' }}
              placeholder="Countries"
              defaultValue=""
              showSearch
              optionFilterProp="label"
            >
              <Select.Option key="All" label="" value="">
                All countries
              </Select.Option>
              {ui.countries.map((c) => (
                <Select.Option key={c.code} label={c.name} value={c.code}>
                  <Image src={c.flag} alt="flag" fallback="/static/no-image.jpg" width={25} preview={false} />
                      &nbsp;
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        )}
        <div className="filter-item">
          <Select
            onChange={(val) => setValue({ ...filterValue, gender: val })}
            style={{ width: '100%' }}
            defaultValue=""
          >
            {GENDERS.map((gen) => (
              <Select.Option key={gen.key} value={gen.key}>
                {gen.text || gen.key}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="filter-item">
          <Select
            onChange={(val) => setValue({ ...filterValue, orientation: val })}
            style={{ width: '100%' }}
            defaultValue=""
          >
            {ORIENTATIONS.map((gen) => (
              <Select.Option key={gen.key} value={gen.key}>
                {gen.text || gen.key}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="filter-item">
          <Select
            onChange={(val) => setValue({ ...filterValue, ages: val })}
            style={{ width: '100%' }}
            placeholder="Ages"
            defaultValue=""
          >
            {AGES.map((i) => (
              <Select.Option key={i.key} value={i.key}>
                {i.text || i.key}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="filter-item">
          <Select
            onChange={(val) => setValue({ ...filterValue, eyes: val })}
            style={{ width: '100%' }}
            placeholder="Eyes color"
            defaultValue=""
          >
            {EYES.map((i) => (
              <Select.Option key={i.key} value={i.key}>
                {i.text || i.key}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="filter-item">
          <Select
            onChange={(val) => setValue({ ...filterValue, hair: val })}
            style={{ width: '100%' }}
            placeholder="Hair color"
            defaultValue=""
          >
            {HAIRS.map((i) => (
              <Select.Option key={i.key} value={i.key}>
                {i.text || i.key}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="filter-item">
          <Select
            onChange={(val) => setValue({ ...filterValue, butt: val })}
            style={{ width: '100%' }}
            placeholder="Select butt size"
            defaultValue=""
          >
            {BUTTS.map((i) => (
              <Select.Option key={i.key} value={i.key}>
                {i.text || i.key}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="filter-item">
          <Select
            onChange={(val) => setValue({ ...filterValue, height: val })}
            style={{ width: '100%' }}
            placeholder="Select height"
            defaultValue=""
          >
            <Select.Option key="all" value="">
              All heights
            </Select.Option>
            {HEIGHTS.map((i) => (
              <Select.Option key={i} value={i}>
                {i}
              </Select.Option>
            ))}
          </Select>
        </div>
        {/* <div className="filter-item">
          <Select
            onChange={(val) => setValue({ ...filterValue, weight: val })}
            style={{ width: '100%' }}
            placeholder="Select weight"
            defaultValue=""
          >
            <Select.Option key="all" value="">
              All weights
            </Select.Option>
            {WEIGHTS.map((i) => (
              <Select.Option key={i} value={i}>
                {i}
              </Select.Option>
            ))}
          </Select>
        </div> */}
        <div className="filter-item">
          <Select
            onChange={(val) => setValue({ ...filterValue, ethnicity: val })}
            style={{ width: '100%' }}
            placeholder="Select ethnicity"
            defaultValue=""
          >
            {ETHNICITIES.map((i) => (
              <Select.Option key={i.key} value={i.key}>
                {i.text || i.key}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="filter-item">
          <Select
            onChange={(val) => setValue({ ...filterValue, bodyType: val })}
            style={{ width: '100%' }}
            placeholder="Select body type"
            defaultValue=""
          >
            {BODY_TYPES.map((i) => (
              <Select.Option key={i.key} value={i.key}>
                {i.text || i.key}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
      <Button onClick={() => onSearch()} block className="primary">
        <SearchOutlined />
        {' '}
        SEARCH
      </Button>
      {ui.logo && <img src={ui.logo} alt="logo" width="125px" style={{ position: 'absolute', bottom: 10 }} />}
    </div>
  );
};

export default SearchBar;
