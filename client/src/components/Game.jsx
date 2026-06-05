
function NetworkMap({ network, showSegments = true }) {

  const width = 1000;
  const height = 700;
  const padding = 40;

  const stations = network.stations || [];

  // 🔥 CALCOLO BOUNDING BOX REALE
  const minX = Math.min(...stations.map(s => s.positionX));
  const maxX = Math.max(...stations.map(s => s.positionX));
  const minY = Math.min(...stations.map(s => s.positionY));
  const maxY = Math.max(...stations.map(s => s.positionY));

  const mapX = (x) =>
    padding +
    ((x - minX) / (maxX - minX)) * (width - 2 * padding);

  const mapY = (y) =>
    padding +
    ((y - minY) / (maxY - minY)) * (height - 2 * padding);

  const stationMap = new Map(
    stations.map(s => [Number(s.id), s])
  );

  const lineMap = new Map(
    (network.lines || []).map(l => [Number(l.id), l])
  );

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ background: "#fafafa", border: "1px solid #ddd" }}
    >

      {/* SEGMENTS */}
      {showSegments && (network.segments || []).map(segment => {

        const [aId, bId] = segment.stationIds.map(Number);

        const stationA = stationMap.get(aId);
        const stationB = stationMap.get(bId);

        if (!stationA || !stationB) return null;

        const x1 = mapX(stationA.positionX);
        const y1 = mapY(stationA.positionY);
        const x2 = mapX(stationB.positionX);
        const y2 = mapY(stationB.positionY);

        const dx = x2 - x1;
        const dy = y2 - y1;

        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) return null;

        const nx = -dy / length;
        const ny = dx / length;

        const key = `${Math.min(aId, bId)}-${Math.max(aId, bId)}`;

        const sameSegments = network.segments.filter(s => {
          const [a, b] = s.stationIds.map(Number);
          return `${Math.min(a, b)}-${Math.max(a, b)}` === key;
        });

        const index = sameSegments.findIndex(s => s.id === segment.id);

        const totalWidth = 10;
        const segmentWidth = totalWidth / sameSegments.length;

        const offset =
          (index - (sameSegments.length - 1) / 2) * segmentWidth;

        const line = lineMap.get(Number(segment.lineId));

        return (
          <line
            key={segment.id}
            x1={x1 + nx * offset}
            y1={y1 + ny * offset}
            x2={x2 + nx * offset}
            y2={y2 + ny * offset}
            stroke={line?.color || "black"}
            strokeWidth={segmentWidth}
            strokeLinecap="round"
          />
        );
      })}

      {/* STATIONS */}
      {stations.map(station => {

        const x = mapX(station.positionX);
        const y = mapY(station.positionY);

        return (
          <g key={station.id}>

            {/* label background */}
            <rect
              x={x + 10}
              y={y - 20}
              width={station.name.length * 7}
              height={18}
              fill="white"
              rx={4}
              opacity={0.9}
            />

            <text
              x={x + 12}
              y={y - 7}
              fontSize="12"
            >
              {station.name}
            </text>

            <circle
              cx={x}
              cy={y}
              r={9}
              fill="white"
              stroke="black"
              strokeWidth={2}
            />

          </g>
        );
      })}

    </svg>
  );
}

function SegmentsList(props) {

}

function Segment(props) {

}

function SelectedRoute(props) {

}

function SelectedSegment(props) {

}

function Timer(props) {
    return (
        <>
            <p className={`m-0 me-2 ${props.seconds <= 10 && 'text-danger'}`}><strong>{props.seconds}</strong>s</p>
            <i class="bi bi-stopwatch-fill"></i>
        </>
    )
}

function Coins(props) {
    return (
        <>
            <p className="m-0 me-2"><strong>{props.amount}</strong></p>
            <i class="bi bi-coin"></i>
        </>
    )
}

function EventsCarousel(props) {

}

export { NetworkMap, SegmentsList, SelectedRoute, Timer, Coins, EventsCarousel }
