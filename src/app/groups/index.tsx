import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	SafeAreaView,
	StyleSheet,
	Text,
	View,
} from "react-native";

import { supabase } from "../../lib/supabase";

type Group = {
	id: string;
	name: string;
	created_at: string;
};

export default function GroupsScreen() {
	const [groups, setGroups] = useState<Group[]>([]);
	const [loading, setLoading] = useState(true);

	const loadGroups = useCallback(async () => {
		setLoading(true);

		const { data, error } = await supabase
			.from("groups")
			.select("id, name, created_at")
			.order("created_at", { ascending: false });

		if (error) {
			console.error(error);
			setLoading(false);
			return;
		}

		setGroups(data ?? []);
		setLoading(false);
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadGroups();
		}, [loadGroups]),
	);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Mina grupper</Text>

				<Pressable
					style={styles.button}
					onPress={() => router.push("/groups/create")}
				>
					<Text style={styles.buttonText}>Ny grupp</Text>
				</Pressable>
			</View>

			{loading ? (
				<ActivityIndicator />
			) : groups.length === 0 ? (
				<Text style={styles.empty}>Du har inga grupper ännu.</Text>
			) : (
				<FlatList
					data={groups}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.list}
					renderItem={({ item }) => (
						<View style={styles.groupCard}>
							<Text style={styles.groupName}>{item.name}</Text>
						</View>
					)}
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
	},

	header: {
		gap: 16,
		marginBottom: 24,
	},

	title: {
		fontSize: 32,
		fontWeight: "700",
	},

	button: {
		backgroundColor: "#111",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		alignSelf: "flex-start",
	},

	buttonText: {
		color: "white",
		fontWeight: "600",
	},

	empty: {
		fontSize: 16,
	},

	list: {
		gap: 12,
	},

	groupCard: {
		padding: 16,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
	},

	groupName: {
		fontSize: 18,
		fontWeight: "600",
	},
});
