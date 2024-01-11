<template>
  <div>
    <Textarea :usernames="usernames" />
  </div>
</template>

<script>
import Textarea from "./components/MarkdownEditor.vue";

export default {
  name: "App",
  data() {
    return {
      usernames: ["user1", "user2", "user3"],
    };
  },
  components: {
    Textarea,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
