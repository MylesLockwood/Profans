import { useEffect, useState } from 'react';
import Moveable from 'react-moveable';

interface IProps {
  text: string;
  color: string;
  onMoveText: Function;
}

export default function MoveAbleText({ text, color, onMoveText }: IProps) {
  const [target, setTarget] = useState();
  const [frame] = useState({
    translate: [0, 0],
    rotate: 0,
    transformOrigin: '50% 50%'
  });
  useEffect(() => setTarget(document.querySelector('.target') as any), []);

  return (
    <div className="preview-text" style={{ color }}>
      <div className="target">{text}</div>
      <Moveable
        target={target}
        originDraggable={false}
        originRelative={false}
        draggable
        throttleDrag={0}
        startDragRotate={0}
        throttleDragRotate={0}
        zoom={1}
        origin={false}
        rotatable
        throttleRotate={0}
        rotationPosition="top"
        onDragOriginStart={(e) => {
          e.dragStart && e.dragStart.set(frame.translate);
        }}
        onDragOrigin={(e) => {
          frame.translate = e.drag.beforeTranslate;
          frame.transformOrigin = e.transformOrigin;
        }}
        onDragStart={(e) => {
          e.set(frame.translate);
        }}
        onDrag={(e) => {
          frame.translate = e.beforeTranslate;
        }}
        onRotateStart={(e) => {
          e.set(frame.rotate);
        }}
        onRotate={(e) => {
          frame.rotate = e.beforeRotate;
        }}
        onRender={(e) => {
          const { translate, rotate, transformOrigin } = frame;
          onMoveText(frame);
          e.target.style.transformOrigin = transformOrigin;
          e.target.style.transform = `translate(${translate[0]}px, ${translate[1]}px)`
                    + ` rotate(${rotate}deg)`;
        }}
      />
    </div>
  );
}
