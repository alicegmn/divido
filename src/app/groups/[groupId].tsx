import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	SafeAreaView,
	StyleSheet,
	Text,
	View,
} from "react-native";

import { supabase } from "../../lib/supabase";

type Group = {
	id: string;
	name: string;
};

type Profile = {
	display_name: string;
};

type Member = {
	user_id: string;
	profiles: Profile | Profile[] | null;
};

export default function GroupDetailsScreen() {
	const { groupId } = useLocalSearchParams<{ groupId: string }>();

	const [group, setGroup] = useState<Group | null>(null);
	const [members, setMembers] = useState<Member[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadGroup = async () => {
			if (!groupId) {
				return;
			}

			setLoading(true);

			const { data: groupData, error: groupError } = await supabase
				.from("groups")
				.select("id, name")
				.eq("id", groupId)
				.single();

			if (groupError) {
				console.error(groupError);
				setLoading(false);
				return;
			}

			const { data: membersData, error: membersError } = await supabase
				.from("group_members")
				.select(
					`
          user_id,
          profiles (
            display_name
          )
        `,
				)
				.eq("group_id", groupId);

			if (membersError) {
				console.error(membersError);
				setLoading(false);
				return;
			}

			setGroup(groupData);
			setMembers(membersData ?? []);
			setLoading(false);
		};

		loadGroup();
	}, [groupId]);

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<ActivityIndicator />
			</SafeAreaView>
		);
	}

	if (!group) {
		return (
			<SafeAreaView style={styles.container}>
				<Text>Kunde inte hitta gruppen.</Text>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.title}>{group.name}</Text>

			<Text style={styles.sectionTitle}>Medlemmar</Text>

			<View style={styles.memberList}>
				{members.map((member) => {
					const profile = Array.isArray(member.profiles)
						? member.profiles[0]
						: member.profiles;

					return (
						<View key={member.user_id} style={styles.memberCard}>
							<Text style={styles.memberName}>
								{profile?.display_name ?? "Okänd användare"}
							</Text>
						</View>
					);
				})}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
	},

	title: {
		fontSize: 32,
		fontWeight: "700",
		marginBottom: 32,
	},

	sectionTitle: {
		fontSize: 20,
		fontWeight: "600",
		marginBottom: 12,
	},

	memberList: {
		gap: 12,
	},

	memberCard: {
		padding: 16,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
	},

	memberName: {
		fontSize: 16,
		fontWeight: "500",
	},
});
