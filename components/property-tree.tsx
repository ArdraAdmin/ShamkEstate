"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Property } from "@/lib/data/types";

type Node = {
  key: string;
  label: string;
  children?: Node[];
  property?: Property;
};

function buildTree(props: Property[]): Node[] {
  const companies = new Map<string, Map<string, Map<string, Map<string, Map<string, Property[]>>>>>();
  for (const p of props) {
    if (!companies.has(p.companyId)) companies.set(p.companyId, new Map());
    const states = companies.get(p.companyId)!;
    if (!states.has(p.state)) states.set(p.state, new Map());
    const cities = states.get(p.state)!;
    if (!cities.has(p.city)) cities.set(p.city, new Map());
    const areas = cities.get(p.city)!;
    if (!areas.has(p.area)) areas.set(p.area, new Map());
    const buildings = areas.get(p.area)!;
    if (!buildings.has(p.building)) buildings.set(p.building, []);
    buildings.get(p.building)!.push(p);
  }

  return Array.from(companies.entries()).map(([companyId, states]) => ({
    key: companyId,
    label: props.find((p) => p.companyId === companyId)
      ? requireCompany(props, companyId)
      : companyId,
    children: Array.from(states.entries()).map(([state, cities]) => ({
      key: `${companyId}-${state}`,
      label: state,
      children: Array.from(cities.entries()).map(([city, areas]) => ({
        key: `${companyId}-${city}`,
        label: city,
        children: Array.from(areas.entries()).map(([area, buildings]) => ({
          key: `${companyId}-${area}`,
          label: area,
          children: Array.from(buildings.entries()).map(([building, units]) => ({
            key: `${companyId}-${building}`,
            label: building,
            children: units.map((property) => ({
              key: property.id,
              label: `Unit ${property.unitNumber}`,
              property,
            })),
          })),
        })),
      })),
    })),
  }));

  function requireCompany(list: Property[], id: string) {
    const names: Record<string, string> = {
      "c-sm": "Shamak Mercantile",
      "c-shr": "SHR Trading",
      "c-mh": "Meridian Holdings",
      "c-lmp": "Lav Mahtani (Personal)",
      "c-mft": "Mahtani Family Trust",
      "c-ar": "Ardra Realty LLP",
      "c-cl": "Crestline Properties",
      "c-he": "Horizon Estates",
      "c-sv": "Silverline Ventures",
      "c-nv": "Nirvaan Capital",
    };
    return names[id] ?? list.find((p) => p.companyId === id)?.companyId ?? id;
  }
}

function TreeNode({
  node,
  depth,
  selected,
  onSelect,
}: {
  node: Node;
  depth: number;
  selected?: string;
  onSelect: (p?: Property, key?: string) => void;
}) {
  const [open, setOpen] = useState(depth < 2);
  const hasKids = Boolean(node.children?.length);
  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (node.property) onSelect(node.property, node.key);
          else {
            setOpen((v) => !v);
            onSelect(undefined, node.key);
          }
        }}
        className={cn(
          "flex w-full items-center gap-1 rounded-md px-2 py-1 text-left text-xs hover:bg-slate-100",
          selected === node.key && "bg-indigo-50 text-indigo-700"
        )}
        style={{ paddingLeft: 8 + depth * 10 }}
      >
        {hasKids ? (
          <ChevronRight className={cn("size-3 shrink-0 transition", open && "rotate-90")} />
        ) : (
          <span className="w-3" />
        )}
        <span className="truncate">{node.label}</span>
      </button>
      {open && hasKids
        ? node.children!.map((c) => (
            <TreeNode key={c.key} node={c} depth={depth + 1} selected={selected} onSelect={onSelect} />
          ))
        : null}
    </div>
  );
}

export function PropertyTree({
  properties,
  onSelect,
}: {
  properties: Property[];
  onSelect: (property?: Property, pathKey?: string) => void;
}) {
  const tree = useMemo(() => buildTree(properties), [properties]);
  const [selected, setSelected] = useState<string>();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2">
      <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">Hierarchy</div>
      {tree.map((n) => (
        <TreeNode
          key={n.key}
          node={n}
          depth={0}
          selected={selected}
          onSelect={(p, key) => {
            setSelected(key);
            onSelect(p, key);
          }}
        />
      ))}
    </div>
  );
}
