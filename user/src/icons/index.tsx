/* eslint-disable react/require-default-props */
import { CSSProperties } from 'react';
import Icon from '@ant-design/icons';

interface IIcons {
  style?: CSSProperties;
  rotate?: number;
  spin?: boolean;
  className?: string;
}

const ModelSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 32 32">
    <path id="call-center-agent" d="M51.14,20.906a9.759,9.759,0,0,0,1.414-5.048V9.672c-.536-12.9-18.913-12.891-19.444,0v6.187a9.759,9.759,0,0,0,1.414,5.048,8.085,8.085,0,0,0-4.949,7.443V30H56.089V28.35A8.085,8.085,0,0,0,51.14,20.906ZM34.877,9.672c.438-10.555,15.475-10.547,15.909,0v6.187a7.859,7.859,0,0,1-1.417,4.533,8.09,8.09,0,0,0-1.352-.114h-1.65v-2a6.184,6.184,0,0,0,2.651-5.074V10.6l-.787-.087a7.06,7.06,0,0,1-6.209-6L41.87,3.468l-1,.335a6.18,6.18,0,0,0-4.223,5.868v3.535a6.213,6.213,0,0,0,.063.884H34.877V9.672Zm7.954,7.954A4.415,4.415,0,0,1,39.3,15.858h0a2.55,2.55,0,0,1-.537-.841c-.3-.867-.261-.927-.261-.927h0a4.422,4.422,0,0,1-.089-.884V9.672a4.415,4.415,0,0,1,2.1-3.766,8.832,8.832,0,0,0,6.735,6.24v1.061A4.424,4.424,0,0,1,42.831,17.626Zm0,1.768a6.168,6.168,0,0,0,1.768-.258v1.142a1.768,1.768,0,0,1-3.535,0V19.136A6.166,6.166,0,0,0,42.831,19.394ZM39.96,26.762,37.908,24.71l1.712-1.642Zm1.477-3.236a3.556,3.556,0,0,0,2.787,0l-.431,4.705H41.87Zm4.6-.458,1.714,1.642L45.7,26.763Zm-11.164-7.21h2.365A6.229,6.229,0,0,0,39.3,18.281v2h-1.65a8.09,8.09,0,0,0-1.352.114A7.859,7.859,0,0,1,34.877,15.858Zm2.769,6.187h.487l-2.752,2.638,3.549,3.549H31.343A6.312,6.312,0,0,1,37.646,22.045Zm9.087,6.187,3.549-3.549-2.753-2.638h.488a6.312,6.312,0,0,1,6.3,6.187Z" transform="translate(-26.574 1)" />
  </svg>
);

const HomeSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 32 32">
    <path d="M29,13.82a1,1,0,0,0-.37-.77l-12-9.82a1,1,0,0,0-1.26,0l-12,9.82a1,1,0,0,0-.37.77,1,1,0,0,0,1,1,.94.94,0,0,0,.63-.23L6,13.47V24.2A2.81,2.81,0,0,0,8.8,27h2.9a2.81,2.81,0,0,0,2.8-2.8V22.8a.8.8,0,0,1,.8-.8h1.4a.8.8,0,0,1,.8.8v1.4A2.81,2.81,0,0,0,20.3,27h2.9A2.81,2.81,0,0,0,26,24.2V13.47l1.37,1.12a.94.94,0,0,0,.63.23A1,1,0,0,0,29,13.82ZM24,24.2a.8.8,0,0,1-.8.8H20.3a.8.8,0,0,1-.8-.8V22.8A2.81,2.81,0,0,0,16.7,20H15.3a2.81,2.81,0,0,0-2.8,2.8v1.4a.8.8,0,0,1-.8.8H8.8a.8.8,0,0,1-.8-.8V11.84l8-6.55,8,6.55Z" />
  </svg>
);

const PlusSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 30 30">
    <path d="M21,15H17V11a1,1,0,0,0-2,0v4H11a1,1,0,0,0,0,2h4v4a1,1,0,0,0,2,0V17h4a1,1,0,0,0,0-2ZM23,5H9A4,4,0,0,0,5,9V23a4,4,0,0,0,4,4H23a4,4,0,0,0,4-4V9A4,4,0,0,0,23,5Zm2,18a2,2,0,0,1-2,2H9a2,2,0,0,1-2-2V9A2,2,0,0,1,9,7H23a2,2,0,0,1,2,2Z" />
  </svg>
);

const MessageSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 30 30">
    <path d="M21,5H11a6,6,0,0,0-6,6V28.5a1,1,0,0,0,.81,1l.19,0a1,1,0,0,0,.93-.63A3,3,0,0,1,9.69,27H21a6,6,0,0,0,6-6V11A6,6,0,0,0,21,5Zm4,16a4,4,0,0,1-4,4H9.69A4.9,4.9,0,0,0,7,25.79V11a4,4,0,0,1,4-4H21a4,4,0,0,1,4,4Zm-6-8H13a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2Zm-3,4H13a1,1,0,0,0,0,2h3a1,1,0,0,0,0-2Z" />
  </svg>
);

const UserSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 28 28">
    <path d="M16,4A12,12,0,1,0,28,16,12,12,0,0,0,16,4Zm0,22a10.17,10.17,0,0,1-2.66-.37,3,3,0,0,1,5.32,0A10.17,10.17,0,0,1,16,26Zm4.52-1.09a5,5,0,0,0-9,0,10,10,0,1,1,9,0ZM16,12a4,4,0,1,0,4,4A4,4,0,0,0,16,12Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,16,18Z" />
  </svg>
);

const TickSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 25 25">
    <path d="M23,12a1,1,0,0,0-.28-.7l-1.15-1.19a1,1,0,0,0-.72-.3,1,1,0,0,0-1,1,1,1,0,0,0,.28.69l.48.5-.69.72a4,4,0,0,0-1.14,2.78,3.43,3.43,0,0,0,0,.56l.14,1-1,.17a4,4,0,0,0-2.85,2.07l-.47.88-.91-.44a3.94,3.94,0,0,0-1.75-.4,4.15,4.15,0,0,0-1.76.4l-.9.44-.47-.88A4,4,0,0,0,6,17.23l-1-.17.14-1a3.39,3.39,0,0,0,0-.55,4,4,0,0,0-1.13-2.78L3.39,12l.69-.72A4,4,0,0,0,5.22,8.5a3.43,3.43,0,0,0,0-.56L5,6.94l1-.17A4,4,0,0,0,8.87,4.7l.47-.88.91.44a3.94,3.94,0,0,0,1.75.4,4.15,4.15,0,0,0,1.76-.4l.9-.44.46.86a1,1,0,0,0,1.93-.39,1,1,0,0,0-.18-.57L16,2a1,1,0,0,0-.88-.53,1,1,0,0,0-.44.1l-1.76.87a2.14,2.14,0,0,1-.89.2,2.06,2.06,0,0,1-.88-.2L9.35,1.59A1,1,0,0,0,8,2L7.11,3.76a2,2,0,0,1-1.43,1l-1.94.34a1,1,0,0,0-.83,1,.66.66,0,0,0,0,.14l.28,2a2.64,2.64,0,0,1,0,.28,2,2,0,0,1-.57,1.39L1.28,11.31a1,1,0,0,0,0,1.38l1.38,1.43a2,2,0,0,1,.56,1.38,2.64,2.64,0,0,1,0,.28l-.28,2a.66.66,0,0,0,0,.14,1,1,0,0,0,.83,1l1.94.34a2,2,0,0,1,1.43,1L8,22a1,1,0,0,0,1.32.43l1.76-.87a2.14,2.14,0,0,1,.89-.2,2.06,2.06,0,0,1,.88.2l1.77.87a1,1,0,0,0,.44.1A1,1,0,0,0,16,22l.92-1.74a2,2,0,0,1,1.43-1l1.94-.34a1,1,0,0,0,.83-1,.66.66,0,0,0,0-.14l-.28-2a2.64,2.64,0,0,1,0-.28,2,2,0,0,1,.57-1.39l1.37-1.42A1,1,0,0,0,23,12ZM9.71,10.29A1,1,0,0,0,9,10a1,1,0,0,0-1,1,1,1,0,0,0,.29.71L12,15.41l9.71-9.7A1,1,0,0,0,22,5a1,1,0,0,0-1-1,1,1,0,0,0-.71.29L12,12.59Z" />
  </svg>
);

const ShareSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 14a1 1 0 00-1 1v3a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1h4a1 1 0 000-2H6a3 3 0 00-3 3v12a3 3 0 003 3h12a3 3 0 003-3v-3a1 1 0 00-1-1zm-1.41-8H17a9 9 0 00-9 9 1 1 0 002 0 7 7 0 017-7h1.59l-2.3 2.29A1 1 0 0016 11a1 1 0 001 1 1 1 0 00.71-.29L22.41 7l-4.7-4.71A1 1 0 0017 2a1 1 0 00-1 1 1 1 0 00.29.71z" />
  </svg>
);

export const ModelIcon = ({
  style, rotate, spin, className
}: IIcons) => (
  <Icon component={ModelSvg} className={className ? `${className} anticon-custom` : 'anticon-custom'} {...{ style, rotate, spin }} />
);

export const HomeIcon = ({
  style, rotate, spin, className
}: IIcons) => (
  <Icon component={HomeSvg} className={className ? `${className} anticon-custom` : 'anticon-custom'} {...{ style, rotate, spin }} />
);

export const PlusIcon = ({
  style, rotate, spin, className
}: IIcons) => (
  <Icon component={PlusSvg} className={className ? `${className} anticon-custom` : 'anticon-custom'} {...{ style, rotate, spin }} />
);

export const MessageIcon = ({
  style, rotate, spin, className
}: IIcons) => (
  <Icon component={MessageSvg} className={className ? `${className} anticon-custom` : 'anticon-custom'} {...{ style, rotate, spin }} />
);

export const UserIcon = ({
  style, rotate, spin, className
}: IIcons) => (
  <Icon component={UserSvg} className={className ? `${className} anticon-custom` : 'anticon-custom'} {...{ style, rotate, spin }} />
);

export const TickIcon = ({
  style, rotate, spin, className
}: IIcons) => (
  <Icon component={TickSvg} className={className ? `${className} anticon-custom` : 'anticon-custom'} {...{ style, rotate, spin }} />
);

export const ShareIcon = ({
  style, rotate, spin, className
}: IIcons) => (
  <Icon component={ShareSvg} className={className ? `${className} anticon-custom` : 'anticon-custom'} {...{ style, rotate, spin }} />
);
