import mongoose from "mongoose";
declare const User: mongoose.Model<{
    fullName: string;
    email: string;
    password: string;
    userType: "student" | "educator";
    createdAt: NativeDate;
    phoneNumber?: string | null;
    gender?: "male" | "female" | "other" | null;
    avatar?: string | null;
}, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    fullName: string;
    email: string;
    password: string;
    userType: "student" | "educator";
    createdAt: NativeDate;
    phoneNumber?: string | null;
    gender?: "male" | "female" | "other" | null;
    avatar?: string | null;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    fullName: string;
    email: string;
    password: string;
    userType: "student" | "educator";
    createdAt: NativeDate;
    phoneNumber?: string | null;
    gender?: "male" | "female" | "other" | null;
    avatar?: string | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    fullName: string;
    email: string;
    password: string;
    userType: "student" | "educator";
    createdAt: NativeDate;
    phoneNumber?: string | null;
    gender?: "male" | "female" | "other" | null;
    avatar?: string | null;
}, mongoose.Document<unknown, {}, {
    fullName: string;
    email: string;
    password: string;
    userType: "student" | "educator";
    createdAt: NativeDate;
    phoneNumber?: string | null;
    gender?: "male" | "female" | "other" | null;
    avatar?: string | null;
}, {
    id: string;
}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<{
    fullName: string;
    email: string;
    password: string;
    userType: "student" | "educator";
    createdAt: NativeDate;
    phoneNumber?: string | null;
    gender?: "male" | "female" | "other" | null;
    avatar?: string | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    [path: string]: mongoose.SchemaDefinitionProperty<undefined, any, any>;
} | {
    [x: string]: mongoose.SchemaDefinitionProperty<any, any, mongoose.Document<unknown, {}, {
        fullName: string;
        email: string;
        password: string;
        userType: "student" | "educator";
        createdAt: NativeDate;
        phoneNumber?: string | null;
        gender?: "male" | "female" | "other" | null;
        avatar?: string | null;
    }, {
        id: string;
    }, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<{
        fullName: string;
        email: string;
        password: string;
        userType: "student" | "educator";
        createdAt: NativeDate;
        phoneNumber?: string | null;
        gender?: "male" | "female" | "other" | null;
        avatar?: string | null;
    } & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    fullName: string;
    email: string;
    password: string;
    userType: "student" | "educator";
    createdAt: NativeDate;
    phoneNumber?: string | null;
    gender?: "male" | "female" | "other" | null;
    avatar?: string | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    fullName: string;
    email: string;
    password: string;
    userType: "student" | "educator";
    createdAt: NativeDate;
    phoneNumber?: string | null;
    gender?: "male" | "female" | "other" | null;
    avatar?: string | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export default User;
//# sourceMappingURL=User.d.ts.map