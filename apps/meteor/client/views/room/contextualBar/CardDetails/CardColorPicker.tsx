import { Box } from '@rocket.chat/fuselage';
import type { ChangeEvent, PointerEvent } from 'react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cardStyles } from './cardStyles';
import { clamp01, hexToHsv, hsvToHex, isValidHex } from './colorUtils';

type CardColorPickerProps = {
	defaultValue: string;
	onSave: (hex: string) => void;
};

/** Reports where the pointer is inside an element, as fractions from 0 to 1, while it is pressed and dragged. */
const useDrag = (onMove: (x: number, y: number) => void) => {
	const ref = useRef<HTMLDivElement>(null);

	const move = (event: PointerEvent<HTMLDivElement>) => {
		const bounds = ref.current?.getBoundingClientRect();
		if (bounds) {
			onMove(clamp01((event.clientX - bounds.left) / bounds.width), clamp01((event.clientY - bounds.top) / bounds.height));
		}
	};

	return {
		ref,
		onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
			event.currentTarget.setPointerCapture(event.pointerId);
			move(event);
		},
		onPointerMove: (event: PointerEvent<HTMLDivElement>) => event.buttons === 1 && move(event),
	};
};

/** ROMEO's colour picker: the shade area, the hue bar with a preview of the colour, the hex code and a Save button. */
const CardColorPicker = ({ defaultValue, onSave }: CardColorPickerProps) => {
	const { t } = useTranslation();
	const [hsv, setHsv] = useState(() => hexToHsv(isValidHex(defaultValue) ? defaultValue : '#08858b'));
	const [text, setText] = useState(() => (isValidHex(defaultValue) ? defaultValue : '#08858b'));

	const update = (next: typeof hsv) => {
		setHsv(next);
		setText(hsvToHex(next));
	};

	const area = useDrag((x, y) => update({ ...hsv, s: x, v: 1 - y }));
	const hue = useDrag((x) => update({ ...hsv, h: x * 360 }));
	const hex = hsvToHex(hsv);

	return (
		<Box>
			<Box className={[cardStyles.picker]}>
				<Box
					{...area}
					className={[cardStyles.pickerArea]}
					style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))` }}
				>
					<Box is='span' className={[cardStyles.pickerHandle]} style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }} />
				</Box>
				<Box className={[cardStyles.pickerRow]}>
					<Box {...hue} className={[cardStyles.pickerHue]}>
						<Box is='span' className={[cardStyles.pickerHandle]} style={{ left: `${(hsv.h / 360) * 100}%`, top: '50%' }} />
					</Box>
					<Box is='span' className={[cardStyles.pickerPreview]} style={{ background: hex }} />
				</Box>
			</Box>
			<Box
				is='input'
				className={[cardStyles.textInput]}
				value={text}
				aria-label={t('Exentriq_Card_Color_hex')}
				onChange={(event: ChangeEvent<HTMLInputElement>) => {
					const { value } = event.currentTarget;
					setText(value);
					if (isValidHex(value)) {
						setHsv(hexToHsv(value));
					}
				}}
			/>
			<Box marginBlockStart='x16'>
				<Box is='button' type='button' className={[cardStyles.wideButton]} disabled={!isValidHex(text)} onClick={() => onSave(text.trim())}>
					{t('Save')}
				</Box>
			</Box>
		</Box>
	);
};

export default CardColorPicker;
