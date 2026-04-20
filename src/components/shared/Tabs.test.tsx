import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Tabs from './Tabs';
import type { TabItem } from './Tabs';

const tabs: TabItem[] = [
  { key: 'alpha', label: 'Alpha' },
  { key: 'beta', label: 'Beta' },
  { key: 'gamma', label: 'Gamma' },
];

describe('Tabs', () => {
  describe('rendering', () => {
    it('renders a tablist container', () => {
      render(<Tabs tabs={tabs} activeTab="alpha" onChange={vi.fn()} />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('renders one tab button per item', () => {
      render(<Tabs tabs={tabs} activeTab="alpha" onChange={vi.fn()} />);
      expect(screen.getAllByRole('tab')).toHaveLength(3);
    });

    it('renders each tab label', () => {
      render(<Tabs tabs={tabs} activeTab="alpha" onChange={vi.fn()} />);
      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
      expect(screen.getByText('Gamma')).toBeInTheDocument();
    });

    it('applies extra className to the container', () => {
      const { container } = render(
        <Tabs tabs={tabs} activeTab="alpha" onChange={vi.fn()} className="my-page__tabs" />
      );
      expect(container.firstChild).toHaveClass('tabs', 'my-page__tabs');
    });

    it('renders with no className when prop is omitted', () => {
      const { container } = render(
        <Tabs tabs={tabs} activeTab="alpha" onChange={vi.fn()} />
      );
      expect((container.firstChild as Element).className).toBe('tabs');
    });
  });

  describe('active state', () => {
    it('marks the active tab with tabs__tab--active', () => {
      render(<Tabs tabs={tabs} activeTab="beta" onChange={vi.fn()} />);
      const betaBtn = screen.getByRole('tab', { name: 'Beta' });
      expect(betaBtn).toHaveClass('tabs__tab--active');
    });

    it('does not mark inactive tabs with tabs__tab--active', () => {
      render(<Tabs tabs={tabs} activeTab="beta" onChange={vi.fn()} />);
      expect(screen.getByRole('tab', { name: 'Alpha' })).not.toHaveClass('tabs__tab--active');
      expect(screen.getByRole('tab', { name: 'Gamma' })).not.toHaveClass('tabs__tab--active');
    });

    it('sets aria-selected=true on the active tab', () => {
      render(<Tabs tabs={tabs} activeTab="gamma" onChange={vi.fn()} />);
      expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveAttribute('aria-selected', 'true');
    });

    it('sets aria-selected=false on inactive tabs', () => {
      render(<Tabs tabs={tabs} activeTab="gamma" onChange={vi.fn()} />);
      expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('onChange', () => {
    it('calls onChange with the correct key when a tab is clicked', () => {
      const onChange = vi.fn();
      render(<Tabs tabs={tabs} activeTab="alpha" onChange={onChange} />);
      fireEvent.click(screen.getByRole('tab', { name: 'Beta' }));
      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange).toHaveBeenCalledWith('beta');
    });

    it('calls onChange when clicking the already-active tab', () => {
      const onChange = vi.fn();
      render(<Tabs tabs={tabs} activeTab="alpha" onChange={onChange} />);
      fireEvent.click(screen.getByRole('tab', { name: 'Alpha' }));
      expect(onChange).toHaveBeenCalledWith('alpha');
    });
  });

  describe('badge', () => {
    it('renders a badge when badge > 0', () => {
      const withBadge: TabItem[] = [
        { key: 'inbox', label: 'Inbox', badge: 3 },
        { key: 'sent', label: 'Sent' },
      ];
      render(<Tabs tabs={withBadge} activeTab="inbox" onChange={vi.fn()} />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('does not render a badge when badge is 0', () => {
      const withZero: TabItem[] = [{ key: 'empty', label: 'Empty', badge: 0 }];
      render(<Tabs tabs={withZero} activeTab="empty" onChange={vi.fn()} />);
      expect(screen.queryByText('0')).toBeNull();
    });

    it('does not render a badge when badge is undefined', () => {
      const { container } = render(
        <Tabs tabs={[{ key: 'a', label: 'A' }]} activeTab="a" onChange={vi.fn()} />
      );
      expect(container.querySelector('.tabs__badge')).toBeNull();
    });

    it('renders badges only for tabs that have them', () => {
      const mixed: TabItem[] = [
        { key: 'a', label: 'A', badge: 5 },
        { key: 'b', label: 'B' },
        { key: 'c', label: 'C', badge: 0 },
      ];
      render(<Tabs tabs={mixed} activeTab="a" onChange={vi.fn()} />);
      const badges = document.querySelectorAll('.tabs__badge');
      expect(badges).toHaveLength(1);
      expect(badges[0].textContent).toBe('5');
    });
  });

  describe('icon', () => {
    it('renders an icon node inside the tab', () => {
      const withIcon: TabItem[] = [
        { key: 'cam', label: 'Camera', icon: <svg data-testid="cam-icon" /> },
      ];
      render(<Tabs tabs={withIcon} activeTab="cam" onChange={vi.fn()} />);
      expect(screen.getByTestId('cam-icon')).toBeInTheDocument();
    });
  });

  describe('single tab', () => {
    it('works correctly with one tab', () => {
      const onChange = vi.fn();
      render(<Tabs tabs={[{ key: 'only', label: 'Only' }]} activeTab="only" onChange={onChange} />);
      const btn = screen.getByRole('tab', { name: 'Only' });
      expect(btn).toHaveClass('tabs__tab--active');
      fireEvent.click(btn);
      expect(onChange).toHaveBeenCalledWith('only');
    });
  });
});
