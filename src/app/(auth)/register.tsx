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

const registerSchema = z.object({
	displayName: z.string().min(2, "Namnet måste innehålla minst 2 tecken"),

	email: z.email("Ange en giltig e-postadress"),

	password: z.string().min(8, "Lösenordet måste innehålla minst 8 tecken"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterForm>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			displayName: "",
			email: "",
			password: "",
		},
	});

	const onSubmit = async ({ displayName, email, password }: RegisterForm) => {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					display_name: displayName,
				},
			},
		});

		if (error) {
			Alert.alert("Kunde inte skapa konto", error.message);
			return;
		}

		/*
      Supabase kan vara konfigurerat så att användaren
      måste verifiera sin e-postadress.

      Då får vi user men ingen session.
    */
		if (!data.session) {
			Alert.alert(
				"Kontot är skapat",
				"Kontrollera din e-post och verifiera kontot innan du loggar in.",
			);

			router.replace("/(auth)/login");
			return;
		}

		router.replace("/");
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>Skapa konto</Text>

				<Text style={styles.description}>
					Skapa ditt Divido-konto för att börja dela utgifter.
				</Text>

				<Controller
					control={control}
					name="displayName"
					render={({ field: { onChange, onBlur, value } }) => (
						<View style={styles.field}>
							<Text style={styles.label}>Namn</Text>

							<TextInput
								style={styles.input}
								placeholder="Alice"
								value={value}
								onChangeText={onChange}
								onBlur={onBlur}
								autoCapitalize="words"
							/>

							{errors.displayName && (
								<Text style={styles.error}>{errors.displayName.message}</Text>
							)}
						</View>
					)}
				/>

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
								placeholder="Minst 8 tecken"
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
						{isSubmitting ? "Skapar konto..." : "Skapa konto"}
					</Text>
				</Pressable>

				<Link href="/(auth)/login" style={styles.link}>
					Har du redan ett konto? Logga in
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
