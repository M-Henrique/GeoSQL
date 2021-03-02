export let geomColumns = ['geom', 'the_geom', 'way'];

export function changeGeomColumns(newGeomColumns: string[]): void {
   geomColumns = newGeomColumns;
}
