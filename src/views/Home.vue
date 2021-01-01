<template>
	<main class="home">
		<section class="panel">
			<h1>GR</h1>
			<img
				src="@/assets/img/stop.svg"
				alt="Stop"
				@click="
					stopSounds();
					isStoped = !isStoped;
					isPaused = false;
				"
			/>
			<img
				v-if="isPaused"
				src="@/assets/img/play.svg"
				alt="Play"
				@click="
					playSounds();
					isPaused = false;
				"
			/>
			<img
				v-if="!isPaused"
				src="@/assets/img/pause.svg"
				alt="Pause"
				@click="
					pauseSounds();
					isPaused = true;
				"
			/>
			<h1>VE</h1>
			<img
				src="@/assets/img/microphone.svg"
				alt="Play"
				@click="showRecorder = !showRecorder"
			/>
		</section>
		<section class="pads-container">
			<div
				v-for="(sound, key) in sounds"
				:key="sound.title"
				:class="[statusClass(sound), 'pad-' + key]"
				class="pad"
				@click="
					!sound.isPlaying && !sound.isQueued ? playAudio(key) : stopAudio(key)
				"
			>
				<img class="icon" :src="getImgSrc(sound.title)" :alt="sound.title" />
			</div>
		</section>
		<audio-recorder
			class="recorder"
			v-if="showRecorder"
			:filename="'Grooveo-Mix'"
			:show-upload-button="false"
		/>
		<img class="illustration" src="@/assets/img/bg.jpg" />
	</main>
</template>

<script>
import sounds from "@/data/sounds";
export default {
	name: "Home",
	data() {
		return {
			sounds,
			isPaused: false,
			isStoped: false,
			showRecorder: false,
		};
	},
	methods: {
		getImgSrc(title) {
			return require("@/assets/img/" + title + ".svg");
		},
		stopSounds() {
			this.sounds.forEach((sound, key) => {
				this.stopAudio(key);
			});
			this.isPlayDisabled = true;
		},
		pauseSounds() {
			this.sounds.map((sound) => {
				//In case we want to unqueu on stop:
				// sound.isQueued = false;
				if (sound.isPlaying) {
					sound.audio.pause();
					sound.isPlaying = false;
				}
				this.isPlayDisabled = false;
			});
		},
		playSounds() {
			this.sounds.map((sound) => {
				if (sound.audio.currentTime !== 0) {
					sound.audio.play();
					sound.isPlaying = true;
				}
				this.isPlayDisabled = true;
			});
		},
		statusClass(sound) {
			if (sound.isPlaying) return "playing";
			if (sound.isQueued) return "queued";
		},
		replayOnEnd(audio) {
			audio.addEventListener("ended", () => {
				audio.play();
			});
		},
		playQueuedSounds() {
			this.sounds = this.sounds.map((sound) => {
				if (sound.isQueued) {
					sound.isQueued = false;
					sound.isPlaying = true;
					sound.audio.play();
					this.replayOnEnd(sound.audio);
				}
				return sound;
			});
		},
		setNewLeader(sound) {
			sound.isLeader = true;
			this.releaseQueueOnEnd(sound.audio);
		},
		findNewLeader() {
			const playingSoundIndex = this.sounds.findIndex(
				(sound) => sound.isPlaying
			);
			if (playingSoundIndex !== -1) {
				this.setNewLeader(this.sounds[playingSoundIndex]);
			} else {
				const queuedSoundIndex = this.sounds.findIndex(
					(sound) => sound.isQueued
				);
				if (queuedSoundIndex !== -1) {
					this.setNewLeader(this.sounds[queuedSoundIndex]);
				}
			}
		},
		releaseQueueOnEnd(audio) {
			const ctx = this;
			audio.addEventListener("ended", () => {
				ctx.playQueuedSounds();
			});
		},
		playAudio(key) {
			const sound = this.sounds[key];
			if (sound.isPlaying) return;

			const isMusicPlaying = this.sounds.some((sound) => sound.isPlaying);
			if (isMusicPlaying) {
				sound.isQueued = true;
			} else {
				sound.audio.play();
				sound.isPlaying = true;
				this.replayOnEnd(sound.audio);
				this.setNewLeader(sound);
			}
		},
		stopAudio(key) {
			const sound = this.sounds[key];
			sound.audio.pause();
			sound.audio.currentTime = 0;
			sound.isPlaying = false;
			sound.isQueued = false;

			if (sound.isLeader) {
				sound.isLeader = false;
				this.findNewLeader();
				const isMusicPlaying = this.sounds.some((sound) => sound.isPlaying);
				if (!isMusicPlaying) {
					this.playQueuedSounds();
				}
			}
		},
	},
	created() {
		this.sounds = this.sounds.map((sound) => ({
			...sound,
			audio: new Audio(sound.src),
			isPlaying: false,
			isQueued: false,
		}));
	},
};
</script>
<style lang="scss" scoped>
</style>
