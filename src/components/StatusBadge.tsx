interface StatusBadgeProps {
  status: "live" | "in-progress" | "archived";
}

const labels: Record<string, string> = {
  live: "Live",
  "in-progress": "In Progress",
  archived: "Archived",
};

const classes: Record<string, string> = {
  live: "badge badge-live",
  "in-progress": "badge badge-progress",
  archived: "badge badge-archived",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={classes[status]}>
      {status === "live" && (
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
      )}
      {labels[status]}
    </span>
  );
}
