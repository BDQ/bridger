<script>
  import { format, formatRelative, addDays, parseISO } from "date-fns";
  export let date;

  $: {
    const parsedDate = parseISO(date);

    if (addDays(new Date(), -7) > parsedDate) {
      date = format(parsedDate, "HH:mm:ss yyyy-MM-dd O");
    } else {
      date = formatRelative(parsedDate, new Date());
    }
  }
</script>

<span>{date}</span>
