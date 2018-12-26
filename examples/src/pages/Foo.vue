<template>
    <div>{{ random }}</div>
</template>
<script>
export default {
    data: () => ({
        random: Math.random(),
    }),
}
</script>

