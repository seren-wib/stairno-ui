import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';

type Component = Parameters<AstroContainer['renderToString']>[0];

export async function render(
  component: Component,
  props: Record<string, unknown>,
  slots?: Record<string, string>,
) {
  const container = await AstroContainer.create();
  return parse(await container.renderToString(component, { props, slots }));
}
