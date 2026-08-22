import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
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

const loginSchema = z.object({
	email: z.email("Ange en giltig e-postadress"),

	password: z.string().min(1, "Ange ditt lösenord"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginForm>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async ({ email, password }: LoginForm) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			Alert.alert("Kunde inte logga in", error.message);
			return;
		}

		router.replace("/");
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>Divido</Text>

				<Text style={styles.description}>
					Logga in för att se dina delade utgifter.
				</Text>

				<Controller
					control={control}
					name="email"
					render={({ field: { onChange, onBlur, value } }) => (
						<View style={styles.field}>
							<Text style={styles.label}>E-post</Text>

							<TextInput
								style={styles.input}
								placeholder="alice@example.com"
								value={value}
								onChangeText={onChange}
								onBlur={onBlur}
								autoCapitalize="none"
								autoCorrect={false}
								keyboardType="email-address"
							/>

							{errors.email && (
								<Text style={styles.error}>{errors.email.message}</Text>
							)}
						</View>
					)}
				/>

				<Controller
					control={control}
					name="password"
					render={({ field: { onChange, onBlur, value } }) => (
						<View style={styles.field}>
							<Text style={styles.label}>Lösenord</Text>

							<TextInput
								style={styles.input}
								placeholder="Ditt lösenord"
								value={value}
								onChangeText={onChange}
								onBlur={onBlur}
								secureTextEntry
							/>

							{errors.password && (
								<Text style={styles.error}>{errors.password.message}</Text>
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
						{isSubmitting ? "Loggar in..." : "Logga in"}
					</Text>
				</Pressable>

				<Link href="/(auth)/register" style={styles.link}>
					Inget konto? Skapa ett
				</Link>
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
		justifyContent: "center",
		padding: 24,
		gap: 20,
	},

	title: {
		fontSize: 32,
		fontWeight: "700",
	},

	description: {
		fontSize: 16,
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
		fontSize: 14,
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

	link: {
		textAlign: "center",
		fontSize: 16,
	},
});
