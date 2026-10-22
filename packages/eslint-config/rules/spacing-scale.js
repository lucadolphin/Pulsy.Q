// The Fuselage spacing scale, in pixels
const SCALE = [4, 8, 12, 16, 20, 24, 32, 40];

const SPACING_PROP = /^(?:(?:margin|padding)(?:Block|Inline)?(?:Start|End)?|gap|rowGap|columnGap)$/;
const MARGINS_PROP = /^(?:all|block|inline|blockStart|blockEnd|inlineStart|inlineEnd)$/;

const literalValues = (node) => {
	if (!node) return [];
	switch (node.type) {
		case 'Literal':
			return typeof node.value === 'string' || typeof node.value === 'number' ? [{ node, value: node.value }] : [];
		case 'UnaryExpression':
			return node.operator === '-' && node.argument.type === 'Literal' && typeof node.argument.value === 'number'
				? [{ node, value: -node.argument.value }]
				: [];
		case 'TemplateLiteral':
			return node.expressions.length === 0 ? [{ node, value: node.quasis[0].value.cooked }] : [];
		case 'ConditionalExpression':
			return [...literalValues(node.consequent), ...literalValues(node.alternate)];
		case 'LogicalExpression':
			return [...literalValues(node.left), ...literalValues(node.right)];
		case 'JSXExpressionContainer':
		case 'TSAsExpression':
		case 'TSSatisfiesExpression':
			return literalValues(node.expression);
		default:
			return [];
	}
};

const toPixels = (value) => {
	if (typeof value === 'number') return value;
	const token = /^(neg-|-)?x(\d+)$/.exec(value);
	if (token) return (token[1] ? -1 : 1) * Number(token[2]);
	const px = /^(-?\d+(?:\.\d+)?)px$/.exec(value);
	if (px) return Number(px[1]);
	return null;
};

const isOnScale = (pixels) => pixels === 0 || SCALE.includes(Math.abs(pixels));

const elementName = (name) => {
	if (name.type === 'JSXIdentifier') return name.name;
	if (name.type === 'JSXMemberExpression') return name.property.name;
	return '';
};

/** @type {import('eslint').Rule.RuleModule} */
export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Keep spacing props and spacing() calls on the Fuselage spacing scale',
		},
		schema: [
			{
				type: 'object',
				properties: {
					ignoreComponents: { type: 'array', items: { type: 'string' } },
				},
				additionalProperties: false,
			},
		],
		messages: {
			offScale: '{{ value }} is off the spacing scale. Use x4, x8, x12, x16, x20, x24, x32 or x40 (or a negative), 0, none or auto.',
		},
	},
	create(context) {
		const ignoreComponents = new Set(context.options[0]?.ignoreComponents ?? []);

		const check = (expression) => {
			for (const { node, value } of literalValues(expression)) {
				const pixels = toPixels(value);
				if (pixels === null || isOnScale(pixels)) continue;
				context.report({ node, messageId: 'offScale', data: { value: JSON.stringify(value) } });
			}
		};

		return {
			JSXOpeningElement(node) {
				const name = elementName(node.name);
				if (!/^[A-Z]/.test(name) || ignoreComponents.has(name)) return;

				for (const attribute of node.attributes) {
					if (attribute.type !== 'JSXAttribute' || attribute.name.type !== 'JSXIdentifier') continue;
					const prop = attribute.name.name;
					if (SPACING_PROP.test(prop) || (name === 'Margins' && MARGINS_PROP.test(prop))) check(attribute.value);
				}
			},
			CallExpression(node) {
				if (node.callee.type === 'Identifier' && node.callee.name === 'spacing') check(node.arguments[0]);
			},
		};
	},
};
