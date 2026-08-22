import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
	Alert,
	Pressable,
	SafeAreaView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { z } from "zod";

import { supabase } from "../../lib/supabase";

const createGroupSchema = z.object({
	name: z.string().min(2, "Gruppnamnet måste innehålla minst 2 tecken"),
});

type CreateGroupForm = z.infer<typeof createGroupSchema>;

export default function CreateGroupScreen() {
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<CreateGroupForm>({
		resolver: zodResolver(createGroupSchema),
		defaultValues: {
			name: "",
		},
	});

	const onSubmit = async ({ name }: CreateGroupForm) => {
		const { error } = await supabase.rpc("create_group", {
			group_name: name,
		});

		if (error) {
			Alert.alert("Kunde inte skapa grupp", error.message);
			return;
		}

		router.replace("/groups");
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>Skapa grupp</Text>

				<Controller
					control={control}
					name="name"
					render={({ field: { onChange, onBlur, value } }) => (
						<View style={styles.field}>
							<Text style={styles.label}>Gruppnamn</Text>

							<TextInput
								style={styles.input}
								placeholder="Italien 2026"
								value={value}
								onChangeText={onChange}
								onBlur={onBlur}
							/>

							{errors.name && (
								<Text style={styles.error}>{errors.name.message}</Text>
							)}
						</View>
					)}
				/>

				<Pressable
					style={[styles.button, isSubmitting && styles.buttonDisabled]}
					disabled={isSubmitting}
					onPress={handleSubmit(onSubmit)}
				>
					<Text style={styles.buttonText}>
						{isSubmitting ? "Skapar..." : "Skapa grupp"}
					</Text>
				</Pressable>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},

	content: {
		flex: 1,
		padding: 24,
		justifyContent: "center",
		gap: 20,
	},

	title: {
		fontSize: 32,
		fontWeight: "700",
	},

	field: {
		gap: 8,
	},

	label: {
		fontSize: 16,
		fontWeight: "600",
	},

	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 14,
		fontSize: 16,
	},

	error: {
		color: "red",
	},

	button: {
		backgroundColor: "#111",
		borderRadius: 8,
		paddingVertical: 14,
		alignItems: "center",
	},

	buttonDisabled: {
		opacity: 0.5,
	},

	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
});
