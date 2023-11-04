#include <napi.h>
#include <X11/Xlib.h>
#include <X11/Xutil.h>

typedef Window HMONITOR;
typedef int DEVICE_SCALE_FACTOR;

struct Process {
    unsigned long pid;
    std::string path;
};

Process getWindowProcess (Window handle) {
    throw "getWindowProcess is not implemented on Linux";
}

Window find_top_window (unsigned long pid) {
    throw "find_top_window is not implemented on Linux";
}

Napi::Number getProcessMainWindow (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    unsigned long process_id = info[0].ToNumber ().Uint32Value ();

    auto handle = find_top_window (process_id);

    return Napi::Number::New (env, static_cast<int64_t> (handle));
}

Napi::Number createProcess (const Napi::CallbackInfo& info) {
    throw "createProcess is not implemented on Linux";
}


Napi::Number getActiveWindow (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    Display* display = XOpenDisplay(NULL);
    Window root = XDefaultRootWindow(display);
    Atom active_window = XInternAtom(display, "_NET_ACTIVE_WINDOW", False);
    Atom type;
    int format;
    unsigned long nItems, bytesAfter;
    unsigned char *property = NULL;
    Window active = 0;

    if (XGetWindowProperty(display, root, active_window, 0, 1024, False, AnyPropertyType, 
                           &type, &format, &nItems, &bytesAfter, &property) == Success) {
        active = *(Window*)property;
        XFree(property);
    }

    XCloseDisplay(display);

    return Napi::Number::New (env, static_cast<int64_t> (active));
}

template <typename T>
T getValueFromCallbackData (const Napi::CallbackInfo& info, unsigned handleIndex) {
    return static_cast<T> (info[handleIndex].As<Napi::Number> ().Int64Value ());
}


Napi::Object getWindowBounds (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    auto handle{ getValueFromCallbackData<Window> (info, 0) };

    Display* display = XOpenDisplay(NULL);
    Window root;
    int x, y;
    unsigned int width, height, border_width, depth;

    XGetGeometry(display, handle, &root, &x, &y, &width, &height, &border_width, &depth);

    XCloseDisplay(display);

    Napi::Object bounds{ Napi::Object::New (env) };

    bounds.Set ("x", x);
    bounds.Set ("y", y);
    bounds.Set ("width", width);
    bounds.Set ("height", height);

    return bounds;
}

Napi::Boolean setWindowBounds (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    Napi::Object bounds{ info[1].As<Napi::Object> () };
    auto handle{ getValueFromCallbackData<Window> (info, 0) };

    Display* display = XOpenDisplay(NULL);

    XMoveResizeWindow(display, handle, bounds.Get ("x").ToNumber (), bounds.Get ("y").ToNumber (),
                      bounds.Get ("width").ToNumber (), bounds.Get ("height").ToNumber ());

    XCloseDisplay(display);

    return Napi::Boolean::New (env, true);
}

Napi::Boolean showWindow (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    auto handle{ getValueFromCallbackData<Window> (info, 0) };
    std::string type{ info[1].As<Napi::String> () };

    Display* display = XOpenDisplay(NULL);

    if (type == "hide")
        XUnmapWindow(display, handle);
    else
        XMapWindow(display, handle);

    XCloseDisplay(display);

    return Napi::Boolean::New (env, true);
}

Napi::Boolean isWindow (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    auto handle{ getValueFromCallbackData<Window> (info, 0) };

    Display* display = XOpenDisplay(NULL);
    XWindowAttributes attr;
    Status s = XGetWindowAttributes(display, handle, &attr);

    XCloseDisplay(display);

    return Napi::Boolean::New (env, s != 0);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("getProcessMainWindow", Napi::Function::New(env, getProcessMainWindow));
    exports.Set("createProcess", Napi::Function::New(env, createProcess));
    exports.Set("getActiveWindow", Napi::Function::New(env, getActiveWindow));
    exports.Set("getWindowBounds", Napi::Function::New(env, getWindowBounds));
    exports.Set("setWindowBounds", Napi::Function::New(env, setWindowBounds));
    exports.Set("showWindow", Napi::Function::New(env, showWindow));
    exports.Set("isWindow", Napi::Function::New(env, isWindow));
    return exports;
}

NODE_API_MODULE(addon, Init)
