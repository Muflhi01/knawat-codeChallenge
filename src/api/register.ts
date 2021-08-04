"use strict";
import { Mixin } from "ts-mixer";
const { MoleculerClientError } = require("moleculer").Errors;

import { Token } from "../utils/token";
import { UserPayload } from "../utils/types";
import { UserAction } from "../services/users/index";
import { Password } from "../utils/password";

export class Register extends Mixin(Password, Token, UserAction) {
	static params: {
		user: { type: "object" };
	};
	static rest: {
		method: "POST";
		path: "/register";
	};
	constructor(public entity: any, public userData: any) {
		super();
		this.entity = entity;
		this.userData = userData;
	}
	public async $handler(ctx: any, user: any): Promise<any> {
		const userExist = await super.checkIfEmailExist(this.entity.email);
		if (userExist) {
			throw new MoleculerClientError("Email already exist!", 400, "");
		}
		user.password = await super.toHash(this.entity.password);
		super.createUser(user);

		const json = await this.transformEntity(
			{ ...user },
			true,
			ctx.meta.token
		);
		json.user.password = null;
		return json;
	}

	public getToken(user: UserPayload) {
		return super.generateToken(user);
	}
	public async transformEntity(user: any, withToken: boolean, token: string) {
		if (user) {
			if (withToken) {
				user.token = token || (await this.getToken(user));
			}
		}

		return { user };
	}
}
