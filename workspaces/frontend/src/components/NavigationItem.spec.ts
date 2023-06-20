import { render, screen } from '@testing-library/svelte';
import { describe, expect, test } from 'vitest';
import html from 'svelte-htm';
import NavigationItem from './NavigationItem.svelte';

describe('NavigationItem', () => {
  test('should be initialized', async () => {
    render(html`
      <${NavigationItem} counter='5'>
        <span slot='title'>Foo</span>
        <span slot='short-title'>Bar</span>
        <span slot='actions'>Actions</span>
      </${NavigationItem}>
    `);

    expect(screen.getByText('Foo')).toBeInTheDocument();
    expect(screen.getByText('Bar')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
});
