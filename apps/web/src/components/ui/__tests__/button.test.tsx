import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Button } from '../button';
import userEvent from '@testing-library/user-event';

describe('Button Component', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeTruthy();
    expect(button.textContent).toBe('Click me');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    let clicked = false;
    const onClick = () => { clicked = true; };

    render(<Button onClick={onClick}>Click me</Button>);

    await user.click(screen.getByRole('button', { name: /click me/i }));
    expect(clicked).toBe(true);
  });

  it('renders as a child when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    const link = screen.getByRole('link', { name: /link button/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/test');
  });

  it('applies variant classes', () => {
    render(<Button variant="destructive">Destructive</Button>);
    const button = screen.getByRole('button', { name: /destructive/i });
    expect(button.className).toContain('bg-destructive');
  });
});
