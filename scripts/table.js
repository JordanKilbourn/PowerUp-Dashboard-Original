import React, { useMemo, useRef } from 'react'
import { Stage, Layer, Line, Text, Circle, Arrow } from 'react-konva'
import PartNode from './PartNode'
import HookNode from './HookNode'
import { buildSnapTargets } from '@/lib/snapping'
import { rotatePoint } from '@/lib/geometry'
import type { Instruction } from '@/types'

type Props = {
  instruction: Instruction
  updateInstruction: (u: Partial<Instruction>) => void
  onSelectHook: (id: string | null) => void
  selectedHookId: string | null
  stageRef: React.MutableRefObject<any>
  editSnaps: boolean
  onRequestPdf?: () => void
  onRequestImage?: () => void
}

const HOOK_META: Record<string, { name: string; lengthIn: number }> = {
  HOOK_4: { name: 'S-Hook 4"', lengthIn: 4 },
  HOOK_8: { name: 'S-Hook 8"', lengthIn: 8 },
  HOOK_12: { name: 'S-Hook 12"', lengthIn: 12 },
}

export default function CanvasView({
  instruction, updateInstruction, onSelectHook, selectedHookId, stageRef, editSnaps,
  onRequestPdf, onRequestImage
}: Props) {
  const width = 1400, height = 760
  const { part, hooks, settings } = instruction

  // --- Part snap points in world space (rotate w/ part)
  const partWorldSnaps = useMemo(() => {
    const out: { id: string; x: number; y: number }[] = []
    const cx = part.x + part.width / 2, cy = part.y + part.height / 2
    for (const s of part.snapPoints) {
      const px = part.x + s.u * part.width
      const py = part.y + s.v * part.height
      out.push({ id: s.id, ...rotatePoint(px, py, cx, cy, part.rotation) })
    }
    return out
  }, [part])

  // --- Overhead line geometry
  const pad = 140
  const pointerLen = 14
  const lineX0 = pad
  const lineX1 = width - pad
  const lineY = settings.lineY
  const lastSnapX = lineX1 - (pointerLen + 12)

  // --- Eyelets (use pxPerInch * eyeletSpacingIn; stop before arrow head)
  const eyelets = useMemo(() => {
    const step = Math.max(4, settings.pxPerInch * settings.eyeletSpacingIn)
    const xs: number[] = []
    for (let x = lineX0; x <= lastSnapX; x += step) xs.push(x)
    return xs.map((x, i) => ({ id: `eyelet-${i}`, x, y: lineY }))
  }, [settings.pxPerInch, settings.eyeletSpacingIn, lineY])

  // --- Snap targets for hooks (STRICT: only eyelets + part points)
  const snapTargets = useMemo(
    () => buildSnapTargets(eyelets, partWorldSnaps),
    [eyelets, partWorldSnaps]
  )

  // --- Helper to patch a single hook
  function updateHook(hid: string, patch: any) {
    updateInstruction({
      hooks: hooks.map(h => (h.id === hid ? { ...h, ...patch } : h)),
    })
  }

  const showEmpty = !part.imageSrc

  return (
    <div className="flex-1 min-w-0 overflow-hidden relative">
      {/* Empty state overlay */}
      {showEmpty && (
        <div className="absolute inset-0 z-10 grid place-items-center pointer-events-none">
          <div className="pointer-events-auto text-center">
            <div className="text-lg mb-3 opacity-80">No part loaded</div>
            <div className="flex gap-2 justify-center">
              {onRequestPdf && <button className="btn btn-primary" onClick={onRequestPdf}>Add Part from PDF</button>}
              {onRequestImage && (
                <label className="btn">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) onRequestImage(f as any)
                    }}
                  />
                  Image…
                </label>
              )}
            </div>
          </div>
        </div>
      )}

      <Stage width={width} height={height} ref={stageRef}>
        <Layer>
          {/* Overhead line */}
          <Line points={[lineX0, lineY, lineX1, lineY]} stroke="#78cdd1" strokeWidth={3} />
          {settings.showEyelets && eyelets.map(e => (
            <Circle key={e.id} x={e.x} y={e.y} radius={6} fill="#78cdd1" />
          ))}
          <Text
            x={lineX0}
            y={lineY - 24}
            text="Overhead line"
            fontSize={16}
            fill="#a3b9bf"
          />
          {settings.lineDirection === 'LTR' ? (
            <Arrow
              points={[lineX1 - pointerLen, lineY, lineX1, lineY]}
              pointerLength={pointerLen}
              pointerWidth={10}
              stroke="#78cdd1"
              fill="#78cdd1"
              strokeWidth={3}
            />
          ) : (
            <Arrow
              points={[lineX0 + pointerLen, lineY, lineX0, lineY]}
              pointerLength={pointerLen}
              pointerWidth={10}
              stroke="#78cdd1"
              fill="#78cdd1"
              strokeWidth={3}
            />
          )}

          {/* Part (only if an image is present) */}
          {part.imageSrc && (
            <PartNode
              x={part.x} y={part.y} width={part.width} height={part.height}
              rotation={part.rotation} showSnaps={part.showSnaps}
              imgSrc={part.imageSrc} snaps={part.snapPoints}
              onDragEnd={(x, y) => updateInstruction({ part: { ...part, x, y } })}
              onTransform={(w, h, r) => updateInstruction({ part: { ...part, width: w, height: h, rotation: r } })}
              onSnapDrag={(id, u, v) =>
                updateInstruction({
                  part: {
                    ...part,
                    snapPoints: part.snapPoints.map(s => (s.id === id ? { ...s, u, v } : s)),
                  },
                })
              }
              editSnaps={editSnaps}
            />
          )}

          {/* Hooks (NEW API: pass a single `hook` + pxPerInch + snapTargets) */}
          {hooks.map(h => {
            // adapt your stored hook (typeId) to the new HookNode shape that
            // expects `hook.hookType.lengthIn`
            const meta = HOOK_META[h.typeId] ?? { name: h.typeId, lengthIn: 8 }
            const hookForNode: any = { ...h, hookType: meta }

            return (
              <HookNode
                key={h.id}
                hook={hookForNode}
                pxPerInch={settings.pxPerInch}
                editSnaps={editSnaps}
                snapTargets={snapTargets.map(t => ({ ...t, kind: t.kind as 'eyelet' | 'part' }))}
                updateHook={(id, u) => updateHook(id, u)}
                onSelect={(id) => onSelectHook(id)}
              />
            )
          })}
        </Layer>
      </Stage>
    </div>
  )
}
