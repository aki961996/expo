/**
 * useThemeStyles — Centralized theme color hook
 * 
 * Usage in any component:
 *   import { useThemeStyles } from '../hooks/useThemeStyles'
 *   const t = useThemeStyles()
 *   
 *   // Then use:
 *   style={{ background: t.bgBase, color: t.textPrimary }}
 */

import { useTheme } from '../context/ThemeContext'

export function useThemeStyles() {
  const { isDark } = useTheme()

  return {
    // ── Backgrounds ──────────────────────────────────────────
    bgBase:     isDark ? '#080808'  : '#F5F4F0',
    bgSurface:  isDark ? '#0F0F0F'  : '#FFFFFF',
    bgElevated: isDark ? '#141414'  : '#F0EFE9',
    bgHover:    isDark ? '#1A1A1A'  : '#E8E7E1',
    bgActive:   isDark ? '#1F1F1F'  : '#DDDCD6',

    // ── Borders ───────────────────────────────────────────────
    borderSubtle:  isDark ? '#1A1A1A' : '#E2E1DB',
    borderDefault: isDark ? '#1F1F1F' : '#D4D3CD',
    borderHover:   isDark ? '#2F2F2F' : '#B8B7B1',

    // ── Text ──────────────────────────────────────────────────
    textPrimary:   isDark ? '#F5F5F5' : '#111110',
    textSecondary: isDark ? '#9CA3AF' : '#3D3C3A',
    textMuted:     isDark ? '#6B7280' : '#6B6A68',
    textFaint:     isDark ? '#4B5563' : '#8B8A88',
    textGhost:     isDark ? '#374151' : '#A8A7A5',

    // ── Special ───────────────────────────────────────────────
    navBg:      isDark ? 'rgba(8,8,8,0.90)'       : 'rgba(245,244,240,0.92)',
    overlayBg:  isDark ? 'rgba(8,8,8,0.92)'       : 'rgba(245,244,240,0.92)',
    shadowSm:   isDark ? '0 4px 12px rgba(0,0,0,0.4)'  : '0 4px 12px rgba(0,0,0,0.06)',
    shadowMd:   isDark ? '0 8px 24px rgba(0,0,0,0.5)'  : '0 8px 24px rgba(0,0,0,0.10)',
    shadowLg:   isDark ? '0 16px 40px rgba(0,0,0,0.6)' : '0 16px 40px rgba(0,0,0,0.12)',

    // ── Convenience ───────────────────────────────────────────
    isDark,
  }
}