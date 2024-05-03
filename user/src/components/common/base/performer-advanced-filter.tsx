import { PureComponent } from 'react';
import {
  Input, Button, Select, Image
} from 'antd';
import { omit } from 'lodash';
import { ArrowUpOutlined, ArrowDownOutlined, FilterOutlined } from '@ant-design/icons';
import { ICountry } from '@interfaces/index';
import {
  HEIGHTS, WEIGHTS, BODY_TYPES, AGES, BUTTS, ORIENTATIONS, GENDERS, EYES, HAIRS, ETHNICITIES
} from 'src/constants';

interface IProps {
  defaultValue?: {
    q: string;
    isFreeSubscription: string;
    country: string;
    gender: string;
    orientation: string;
    ages: string;
    eyes: string;
    hair: string;
    butt: string;
    height: string;
    weight: string;
    ethnicity: string;
    bodyType: string;
  };
  onSubmit: Function;
  countries: ICountry[]
}

export class PerformerAdvancedFilter extends PureComponent<IProps> {
  state = {
    showMore: true
  };

  handleSubmit() {
    const { onSubmit } = this.props;
    onSubmit(omit(this.state, ['showMore']));
  }

  render() {
    const { countries, defaultValue } = this.props;
    const { showMore } = this.state;
    return (
      <>
        <div className="filter-block custom">
          <div className="filter-item custom">
            <Input
              defaultValue={defaultValue?.q || ''}
              placeholder="Enter keyword"
              onChange={(evt) => this.setState({ q: evt.target.value })}
              onPressEnter={this.handleSubmit.bind(this)}
            />
          </div>
          <div className="filter-item">
            <Select style={{ width: '100%' }} defaultValue="" onChange={(val) => this.setState({ sortBy: val }, () => this.handleSubmit())}>
              <Select.Option value="" disabled>
                <FilterOutlined />
                &nbsp;
                Sort by
              </Select.Option>
              <Select.Option value="popular">
                Popular
              </Select.Option>
              <Select.Option label="" value="latest">
                Latest
              </Select.Option>
              <Select.Option value="oldest">
                Oldest
              </Select.Option>
            </Select>
          </div>
          <div className="filter-item">
            <Button
              type="primary"
              className="primary"
              style={{ width: '100%' }}
              onClick={() => this.setState({ showMore: !showMore })}
            >
              Advanced search
              {' '}
              {showMore ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            </Button>
          </div>
        </div>
        <div className={!showMore ? 'filter-block hide' : 'filter-block custom'}>
          <div className="filter-item">
            <Select
              // eslint-disable-next-line no-nested-ternary
              onChange={(val: any) => this.setState({ isFreeSubscription: val === 'false' ? false : val === 'true' ? true : '' }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              defaultValue={defaultValue?.isFreeSubscription || ''}
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
          </div>
          {countries && countries.length > 0 && (
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ country: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder="Countries"
              defaultValue={defaultValue?.country || ''}
              showSearch
              optionFilterProp="label"
            >
              <Select.Option key="All" label="" value="">
                All countries
              </Select.Option>
              {countries.map((c) => (
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
              onChange={(val) => this.setState({ gender: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              defaultValue={defaultValue?.gender || ''}
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
              onChange={(val) => this.setState({ orientation: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              defaultValue={defaultValue?.orientation || ''}
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
              onChange={(val) => this.setState({ age: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder="Ages"
              defaultValue={defaultValue?.ages || ''}
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
              onChange={(val) => this.setState({ eyes: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder="Eyes color"
              defaultValue={defaultValue?.eyes || ''}
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
              onChange={(val) => this.setState({ hair: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder="Hair color"
              defaultValue={defaultValue?.hair || ''}
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
              onChange={(val) => this.setState({ butt: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder="Select butt size"
              defaultValue={defaultValue?.butt || ''}
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
              onChange={(val) => this.setState({ height: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder="Select height"
              defaultValue={defaultValue?.height || ''}
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
              onChange={(val) => this.setState({ weight: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder="Select weight"
              defaultValue={defaultValue?.weight || ''}
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
              onChange={(val) => this.setState({ ethnicity: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder="Select ethnicity"
              defaultValue={defaultValue?.ethnicity || ''}
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
              onChange={(val) => this.setState({ bodyType: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder="Select body type"
              defaultValue={defaultValue?.bodyType || ''}
            >
              {BODY_TYPES.map((i) => (
                <Select.Option key={i.key} value={i.key}>
                  {i.text || i.key}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </>
    );
  }
}
