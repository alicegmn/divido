import type { User } from "@supabase/supabase-js";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Button,
	SafeAreaView,
	StyleSheet,
	Text,
} from "react-native";

import { supabase } from "../lib/supabase";

export default function HomeScreen() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const getSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				router.replace("/(auth)/login");
				setLoading(false);
				return;
			}

			setUser(session.user);
			setLoading(false);
		};

		getSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (!session) {
				setUser(null);
				router.replace("/(auth)/login");
				return;
			}

			setUser(session.user);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const handleSignOut = async () => {
		await supabase.auth.signOut();
	};

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<ActivityIndicator />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.title}>Divido</Text>

			<Text style={styles.text}>Du är inloggad.</Text>

			<Text style={styles.email}>{user?.email}</Text>

			<Button title="Logga ut" onPress={handleSignOut} />
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
		justifyContent: "center",
		gap: 16,
	},

	title: {
		fontSize: 32,
		fontWeight: "700",
	},

	text: {
		fontSize: 18,
	},

	email: {
		fontSize: 16,
	},
});
